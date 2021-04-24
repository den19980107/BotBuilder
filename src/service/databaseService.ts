import ColumnModel from "../models/database/column.model";
import TableModel from "../models/database/table.model";
import RowModel from "../models/database/row.model";
import ValueModel from "../models/database/value.model";

class DatabaseService {

    static async deleteTableByTableId(tableId: string) {
        try {
            const table = await TableModel.findById(tableId);
            if (table) {
                await TableModel.findByIdAndDelete(tableId);
            } else {
                throw new Error("no table finded");
            }

            // delete row and value
            const rows = await RowModel.find({ belongTableId: tableId });
            for (const row of rows) {
                await this.deleteRowAndValueByRowId(row._id)
            }

            // delete col
            const cols = await ColumnModel.find({ belongTableId: tableId });
            for (const col of cols) {
                await this.deleteColumnByColumnId(col._id);
            }

        } catch (err) {
            throw err;

        }
    }

    static async deleteColumnAndValueByColumnId(columnId: string) {
        await this.deleteColumnByColumnId(columnId);
        await this.deleteTableValue(columnId, null);
    }

    static async deleteColumnByColumnId(columnId: string) {
        try {
            const col = await ColumnModel.findById(columnId);
            if (col) {
                await ColumnModel.findByIdAndDelete(columnId);
            } else {
                throw new Error("no column finded");
            }
        } catch (err) {
            throw err
        }
    }

    static async deleteRowAndValueByRowId(rowId: string) {
        await this.deleteRowByRowId(rowId);
        await this.deleteTableValue(null, rowId);
    }

    static async deleteRowByRowId(rowId: string) {
        try {
            const col = await RowModel.findById(rowId);
            if (col) {
                await RowModel.findByIdAndDelete(rowId);
            } else {
                throw new Error("no row finded");
            }
        } catch (err) {
            throw err
        }
    }

    static async deleteTableValue(columnId: string | null, rowId: string | null) {
        if (!columnId && !rowId) throw new Error("columnId 或 rowId 至少需要提供一個");

        try {
            if (columnId) await ValueModel.deleteMany({ belongColumnId: columnId })
            if (rowId) await ValueModel.deleteMany({ belongRowId: rowId })
            if (columnId && rowId) await ValueModel.deleteMany({ belongColumnId: columnId, belongRowId: rowId })
        } catch (err) {
            throw err
        }
    }
}

export { DatabaseService }