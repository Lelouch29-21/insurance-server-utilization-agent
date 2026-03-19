from __future__ import annotations

import csv
import re
from dataclasses import dataclass
from pathlib import Path
from xml.etree import ElementTree
from zipfile import ZipFile


OFFICE_NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
REL_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
PKG_REL_NS = "http://schemas.openxmlformats.org/package/2006/relationships"

AUTO_HEADER_CANDIDATES = {
    "server",
    "server id",
    "server_id",
    "server name",
    "server_name",
    "hostname",
    "host",
    "instance",
    "instance id",
    "instance_id",
    "vm",
    "vm name",
    "vm_name",
    "node",
}


@dataclass(frozen=True)
class SpreadsheetRow:
    row_index: int
    values_by_column: dict[str, str]


def load_server_ids_from_spreadsheet(
    spreadsheet_path: str | Path,
    sheet_name: str | None = None,
    column: str | None = None,
) -> list[str]:
    path = Path(spreadsheet_path)
    suffix = path.suffix.lower()

    if suffix in {".xlsx", ".xlsm"}:
        return _load_server_ids_from_xlsx(path, sheet_name=sheet_name, column=column)
    if suffix == ".csv":
        return _load_server_ids_from_csv(path, column=column)

    raise ValueError(
        "Unsupported spreadsheet format. Use .xlsx, .xlsm, or .csv for bulk input."
    )


def _load_server_ids_from_csv(path: Path, column: str | None = None) -> list[str]:
    with path.open(newline="") as handle:
        reader = csv.reader(handle)
        rows = [row for row in reader if any(cell.strip() for cell in row)]

    if not rows:
        return []

    spreadsheet_rows = [
        SpreadsheetRow(
            row_index=index + 1,
            values_by_column={
                _column_index_to_letter(column_index): cell.strip()
                for column_index, cell in enumerate(row)
                if cell.strip()
            },
        )
        for index, row in enumerate(rows)
    ]
    return _extract_server_ids(spreadsheet_rows, column=column)


def _load_server_ids_from_xlsx(
    path: Path,
    sheet_name: str | None = None,
    column: str | None = None,
) -> list[str]:
    with ZipFile(path) as archive:
        shared_strings = _read_shared_strings(archive)
        sheets = _read_sheet_map(archive)
        selected_sheet_name, worksheet_path = _select_sheet(sheets, sheet_name)
        rows = _read_worksheet_rows(
            archive=archive,
            worksheet_path=worksheet_path,
            shared_strings=shared_strings,
        )

    if not rows:
        return []

    try:
        return _extract_server_ids(rows, column=column)
    except ValueError as exc:
        raise ValueError(f"{exc} Sheet: '{selected_sheet_name}'.") from exc


def _extract_server_ids(rows: list[SpreadsheetRow], column: str | None = None) -> list[str]:
    header_row = rows[0]
    selected_column, header_consumed = _resolve_target_column(
        header_row=header_row,
        explicit_column=column,
    )

    data_rows = rows[1:] if header_consumed else rows
    server_ids = [
        row.values_by_column.get(selected_column, "").strip()
        for row in data_rows
        if row.values_by_column.get(selected_column, "").strip()
    ]

    if not server_ids:
        raise ValueError(
            f"No server values were found in column '{selected_column}'."
        )
    return server_ids


def _resolve_target_column(
    header_row: SpreadsheetRow,
    explicit_column: str | None,
) -> tuple[str, bool]:
    header_lookup = {
        _normalize_header(value): column_letter
        for column_letter, value in header_row.values_by_column.items()
        if value.strip()
    }

    if explicit_column:
        normalized_explicit = explicit_column.strip()
        normalized_header = _normalize_header(normalized_explicit)
        if normalized_header in header_lookup:
            return header_lookup[normalized_header], True

        if re.fullmatch(r"[A-Za-z]+", normalized_explicit):
            column_letter = normalized_explicit.upper()
            header_value = header_row.values_by_column.get(column_letter, "")
            header_consumed = _normalize_header(header_value) in AUTO_HEADER_CANDIDATES
            return column_letter, header_consumed

        raise ValueError(
            f"Column '{explicit_column}' was not found in the spreadsheet header."
        )

    for candidate in AUTO_HEADER_CANDIDATES:
        if candidate in header_lookup:
            return header_lookup[candidate], True

    if len(header_row.values_by_column) == 1:
        only_column = next(iter(header_row.values_by_column.keys()))
        return only_column, False

    raise ValueError(
        "Unable to auto-detect the server column. Pass --excel-column with a header "
        "name like 'server_id' or an Excel column letter like 'A'."
    )


def _read_shared_strings(archive: ZipFile) -> list[str]:
    shared_strings_path = "xl/sharedStrings.xml"
    if shared_strings_path not in archive.namelist():
        return []

    root = ElementTree.fromstring(archive.read(shared_strings_path))
    values: list[str] = []
    for item in root.findall(f"{{{OFFICE_NS}}}si"):
        values.append(_collect_text(item))
    return values


def _read_sheet_map(archive: ZipFile) -> dict[str, str]:
    workbook_root = ElementTree.fromstring(archive.read("xl/workbook.xml"))
    rels_root = ElementTree.fromstring(archive.read("xl/_rels/workbook.xml.rels"))

    relationships = {
        rel.attrib["Id"]: rel.attrib["Target"]
        for rel in rels_root.findall(f"{{{PKG_REL_NS}}}Relationship")
    }

    sheet_map: dict[str, str] = {}
    for sheet in workbook_root.findall(f".//{{{OFFICE_NS}}}sheet"):
        sheet_name = sheet.attrib.get("name")
        relation_id = sheet.attrib.get(f"{{{REL_NS}}}id")
        if not sheet_name or not relation_id:
            continue
        target = relationships.get(relation_id)
        if not target:
            continue
        worksheet_path = target if target.startswith("xl/") else f"xl/{target}"
        sheet_map[sheet_name] = worksheet_path

    if not sheet_map:
        raise ValueError("No worksheets were found in the Excel workbook.")
    return sheet_map


def _select_sheet(sheet_map: dict[str, str], sheet_name: str | None) -> tuple[str, str]:
    if not sheet_name:
        first_sheet_name = next(iter(sheet_map))
        return first_sheet_name, sheet_map[first_sheet_name]

    if sheet_name not in sheet_map:
        available = ", ".join(sheet_map.keys())
        raise ValueError(
            f"Sheet '{sheet_name}' was not found. Available sheets: {available}"
        )
    return sheet_name, sheet_map[sheet_name]


def _read_worksheet_rows(
    archive: ZipFile,
    worksheet_path: str,
    shared_strings: list[str],
) -> list[SpreadsheetRow]:
    worksheet_root = ElementTree.fromstring(archive.read(worksheet_path))
    rows: list[SpreadsheetRow] = []

    for row in worksheet_root.findall(f".//{{{OFFICE_NS}}}sheetData/{{{OFFICE_NS}}}row"):
        row_index = int(row.attrib.get("r", len(rows) + 1))
        values_by_column: dict[str, str] = {}

        for cell in row.findall(f"{{{OFFICE_NS}}}c"):
            reference = cell.attrib.get("r", "")
            column_letter = _column_letters_from_reference(reference)
            if not column_letter:
                continue

            value = _read_cell_value(cell, shared_strings)
            if value == "":
                continue
            values_by_column[column_letter] = value

        if values_by_column:
            rows.append(SpreadsheetRow(row_index=row_index, values_by_column=values_by_column))

    return rows


def _read_cell_value(cell: ElementTree.Element, shared_strings: list[str]) -> str:
    cell_type = cell.attrib.get("t")

    if cell_type == "inlineStr":
        inline = cell.find(f"{{{OFFICE_NS}}}is")
        return _collect_text(inline).strip() if inline is not None else ""

    value_node = cell.find(f"{{{OFFICE_NS}}}v")
    if value_node is None or value_node.text is None:
        return ""

    raw_value = value_node.text.strip()
    if raw_value == "":
        return ""

    if cell_type == "s":
        index = int(raw_value)
        return shared_strings[index].strip() if index < len(shared_strings) else ""

    return raw_value


def _collect_text(node: ElementTree.Element | None) -> str:
    if node is None:
        return ""
    return "".join(text for text in node.itertext() if text)


def _column_letters_from_reference(reference: str) -> str:
    match = re.match(r"([A-Za-z]+)", reference)
    return match.group(1).upper() if match else ""


def _column_index_to_letter(index: int) -> str:
    number = index + 1
    letters = []
    while number > 0:
        number, remainder = divmod(number - 1, 26)
        letters.append(chr(65 + remainder))
    return "".join(reversed(letters))


def _normalize_header(value: str) -> str:
    return re.sub(r"[_\s]+", " ", value.strip().lower())
