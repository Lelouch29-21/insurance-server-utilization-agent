from __future__ import annotations

import sys
import tempfile
from pathlib import Path
from types import SimpleNamespace
import unittest
from xml.sax.saxutils import escape
from zipfile import ZIP_DEFLATED, ZipFile

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))

from server_utilization_agent.cli import load_server_ids
from server_utilization_agent.spreadsheet import load_server_ids_from_spreadsheet


class SpreadsheetLoaderTest(unittest.TestCase):
    def test_autodetects_server_header_from_xlsx(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            workbook_path = Path(temp_dir) / "servers.xlsx"
            _build_test_workbook(
                workbook_path,
                {
                    "Servers": [
                        ["server_id", "owner"],
                        ["app-server-01", "ops"],
                        ["app-server-02", "ops"],
                    ]
                },
            )

            server_ids = load_server_ids_from_spreadsheet(workbook_path)

            self.assertEqual(server_ids, ["app-server-01", "app-server-02"])

    def test_uses_explicit_sheet_and_header_name(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            workbook_path = Path(temp_dir) / "servers.xlsx"
            _build_test_workbook(
                workbook_path,
                {
                    "Summary": [["ignore_me"], ["foo"]],
                    "BulkInput": [
                        ["hostname", "team"],
                        ["batch-server-03", "platform"],
                        ["edge-server-04", "platform"],
                    ],
                },
            )

            server_ids = load_server_ids_from_spreadsheet(
                workbook_path,
                sheet_name="BulkInput",
                column="hostname",
            )

            self.assertEqual(server_ids, ["batch-server-03", "edge-server-04"])

    def test_supports_column_letter_without_header(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            workbook_path = Path(temp_dir) / "servers.xlsx"
            _build_test_workbook(
                workbook_path,
                {
                    "Servers": [
                        ["", "app-server-01"],
                        ["", "app-server-02"],
                    ]
                },
            )

            server_ids = load_server_ids_from_spreadsheet(
                workbook_path,
                column="B",
            )

            self.assertEqual(server_ids, ["app-server-01", "app-server-02"])

    def test_cli_combines_excel_manual_and_text_inputs_with_deduplication(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            workbook_path = Path(temp_dir) / "servers.xlsx"
            text_path = Path(temp_dir) / "servers.txt"
            _build_test_workbook(
                workbook_path,
                {
                    "Servers": [
                        ["server"],
                        ["app-server-01"],
                        ["batch-server-03"],
                    ]
                },
            )
            text_path.write_text("batch-server-03\nedge-server-04\n")

            args = SimpleNamespace(
                servers=["app-server-01", "app-server-02"],
                servers_file=str(text_path),
                excel_file=str(workbook_path),
                excel_sheet=None,
                excel_column=None,
            )

            server_ids = load_server_ids(args)

            self.assertEqual(
                server_ids,
                [
                    "app-server-01",
                    "app-server-02",
                    "batch-server-03",
                    "edge-server-04",
                ],
            )


def _build_test_workbook(path: Path, sheets: dict[str, list[list[str]]]) -> None:
    sheet_names = list(sheets.keys())
    workbook_xml = _workbook_xml(sheet_names)
    workbook_rels_xml = _workbook_rels_xml(sheet_names)
    content_types_xml = _content_types_xml(sheet_names)

    with ZipFile(path, "w", compression=ZIP_DEFLATED) as archive:
        archive.writestr("[Content_Types].xml", content_types_xml)
        archive.writestr("_rels/.rels", ROOT_RELS_XML)
        archive.writestr("xl/workbook.xml", workbook_xml)
        archive.writestr("xl/_rels/workbook.xml.rels", workbook_rels_xml)

        for index, sheet_name in enumerate(sheet_names, start=1):
            archive.writestr(
                f"xl/worksheets/sheet{index}.xml",
                _worksheet_xml(sheets[sheet_name]),
            )


def _content_types_xml(sheet_names: list[str]) -> str:
    overrides = [
        (
            f'<Override PartName="/xl/worksheets/sheet{index}.xml" '
            'ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
        )
        for index, _ in enumerate(sheet_names, start=1)
    ]
    return (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
        '<Default Extension="xml" ContentType="application/xml"/>'
        '<Override PartName="/xl/workbook.xml" '
        'ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
        + "".join(overrides)
        + "</Types>"
    )


def _workbook_xml(sheet_names: list[str]) -> str:
    sheets_xml = "".join(
        (
            f'<sheet name="{escape(name)}" sheetId="{index}" '
            f'r:id="rId{index}"/>'
        )
        for index, name in enumerate(sheet_names, start=1)
    )
    return (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<workbook '
        'xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
        'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
        f"<sheets>{sheets_xml}</sheets>"
        "</workbook>"
    )


def _workbook_rels_xml(sheet_names: list[str]) -> str:
    relationships_xml = "".join(
        (
            f'<Relationship Id="rId{index}" '
            'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" '
            f'Target="worksheets/sheet{index}.xml"/>'
        )
        for index, _ in enumerate(sheet_names, start=1)
    )
    return (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        f"{relationships_xml}"
        "</Relationships>"
    )


def _worksheet_xml(rows: list[list[str]]) -> str:
    rows_xml = []
    for row_index, row in enumerate(rows, start=1):
        cells_xml = []
        for column_index, value in enumerate(row):
            if value == "":
                continue
            column_letter = _column_index_to_letter(column_index)
            escaped_value = escape(value)
            cells_xml.append(
                f'<c r="{column_letter}{row_index}" t="inlineStr"><is><t>{escaped_value}</t></is></c>'
            )
        rows_xml.append(f'<row r="{row_index}">{"".join(cells_xml)}</row>')

    return (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
        f"<sheetData>{''.join(rows_xml)}</sheetData>"
        "</worksheet>"
    )


def _column_index_to_letter(index: int) -> str:
    number = index + 1
    letters = []
    while number > 0:
        number, remainder = divmod(number - 1, 26)
        letters.append(chr(65 + remainder))
    return "".join(reversed(letters))


ROOT_RELS_XML = (
    '<?xml version="1.0" encoding="UTF-8"?>'
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
    '<Relationship Id="rId1" '
    'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" '
    'Target="xl/workbook.xml"/>'
    "</Relationships>"
)


if __name__ == "__main__":
    unittest.main()
