import ColumnModel, { IColumn, InsertOrUpdateColumnDto } from "../models/database/column.model";
import TableModel, { InsertOrUpdateTableDto } from "../models/database/table.model";
import RowModel, { InsertOrUpdateRowDto } from "../models/database/row.model";
import ValueModel, { InsertOrUpdateValueDto } from "../models/database/value.model";

class DatabaseService {

    // ==========================================================================
    // TABLE CRUD 
    // ==========================================================================

    /**
     * 取得使用者所建立的所有 table
     * @param userId 
     */
    static async getTablesByUserId(userId: string) {
        try {
            const tables = await TableModel.find({ belongUserId: userId });
            console.log(`DATABASE LOG: getTablesByUserId , userId = ${userId}`)
            return tables
        } catch (err) {
            throw err;
        }
    }

    /**
     * 新增 table
     * @param tableData 
     */
    static async createTable(tableData: InsertOrUpdateTableDto) {
        try {
            const newTable = await TableModel.create(tableData)
            await newTable.save();
            console.log(`DATABASE LOG: createTable , tableData = ${tableData}`)
            return newTable
        } catch (err) {
            throw err
        }
    }

    /**
     * 更新 table
     * @param tableData 
     * @param tableId
     */
    static async updateTableName(tableId: string, tableData: InsertOrUpdateTableDto) {
        try {
            await TableModel.findByIdAndUpdate(tableId, tableData);
            console.log(`DATABASE LOG: updateTableName ,tableId = ${tableId}, tableData = ${tableData}`)
        } catch (err) {
            throw err;
        }
    }

    /**
     * 刪除 table 與 table 內的 column、row、value
     * @param tableId 
     */
    static async deleteTableByTableId(tableId: string) {
        try {
            const table = await TableModel.findById(tableId);
            if (table) {
                await TableModel.findByIdAndDelete(tableId);
                console.log(`DATABASE LOG: deleteTableByTableId ,tableId = ${tableId}`)
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

    // ==========================================================================
    // COLUMN CRUD 
    // ==========================================================================

    /**
     * 取得 table 中的 column
     * @param tableId 
     */
    static async getColumnsByTableId(tableId: string) {
        try {
            const columns = await ColumnModel.find({ belongTableId: tableId });
            console.log(`DATABASE LOG: getColumnsByTableId ,tableId = ${tableId}`)
            return columns
        } catch (err) {
            throw err
        }
    }

    /**
     * 新增 column
     * @param columnData 
     */
    static async createColumn(columnData: InsertOrUpdateColumnDto) {
        try {
            const newColumn = await ColumnModel.create(columnData)
            await newColumn.save();
            console.log(`DATABASE LOG: createColumn ,columnData = ${columnData}`)
            return newColumn;
        } catch (err) {
            throw err
        }
    }

    /**
     * 更新 column
     * @param columnId
     * @param columnData 
     */
    static async updateColumn(columnId: string, columnData: InsertOrUpdateColumnDto) {
        try {
            await ColumnModel.findByIdAndUpdate(columnId, columnData);
            console.log(`DATABASE LOG: updateColumn ,columnId = ${columnId},columnData = ${columnData}`)
        } catch (err) {
            throw err;
        }
    }

    /**
     * 刪除 column 與此 table 中該 column 的資料（value）
     * @param columnId 
     */
    static async deleteColumnAndValueByColumnId(columnId: string) {
        try {
            await this.deleteColumnByColumnId(columnId);
            await this.deleteTableValue(columnId, null);
            console.log(`DATABASE LOG: deleteColumnAndValueByColumnId ,columnId = ${columnId}`)
        } catch (err) {
            throw err;
        }
    }

    /**
     * 只刪除 column "不刪除"此 table 內的 column 資料 (value)
     * @param columnId 
     */
    static async deleteColumnByColumnId(columnId: string) {
        try {
            const col = await ColumnModel.findById(columnId);
            if (col) {
                await ColumnModel.findByIdAndDelete(columnId);
                console.log(`DATABASE LOG: deleteColumnByColumnId ,columnId = ${columnId}`)
            } else {
                throw new Error("no column finded");
            }
        } catch (err) {
            throw err
        }
    }

    // ==========================================================================
    // ROW CRUD 
    // ==========================================================================

    /**
     * 取得 table 內的所有 row
     * @param tableId 
     */
    static async getRowsByTableId(tableId: string) {
        try {
            const rows = await RowModel.find({ belongTableId: tableId });
            console.log(`DATABASE LOG: getRowsByTableId ,tableId = ${tableId}`)
            return rows;
        } catch (err) {
            throw err
        }
    }

    /**
     * 新增 row
     * @param rowData 
     */
    static async createRow(rowData: InsertOrUpdateRowDto) {
        try {
            const newRow = await RowModel.create(rowData);
            await newRow.save();
            console.log(`DATABASE LOG: createRow ,rowData = ${rowData}`)
            return newRow
        } catch (err) {
            throw err;
        }
    }

    /**
     * 更新 row
     * @param rowId
     * @param rowData 
     */
    static async updateRow(rowId: string, rowData: InsertOrUpdateRowDto) {
        try {
            await RowModel.findOneAndUpdate({ _id: rowId }, rowData);
            console.log(`DATABASE LOG: updateRow ,rowId = ${rowId}, rowData = ${rowData}`)
        } catch (err) {
            throw err;
        }
    }

    /**
     * 刪除 row 和此 table 內的這條 row 上的 value
     * @param rowId 
     */
    static async deleteRowAndValueByRowId(rowId: string) {
        await this.deleteRowByRowId(rowId);
        await this.deleteTableValue(null, rowId);
        console.log(`DATABASE LOG: deleteRowAndValueByRowId ,rowId = ${rowId}`)
    }

    /**
     * 刪除 row 但 "不刪除" 此 table 內的這條 row 上的 value
     * @param rowId 
     */
    static async deleteRowByRowId(rowId: string) {
        try {
            const col = await RowModel.findById(rowId);
            if (col) {
                await RowModel.findByIdAndDelete(rowId);
                console.log(`DATABASE LOG: deleteRowByRowId ,rowId = ${rowId}`)
            } else {
                throw new Error("no row finded");
            }
        } catch (err) {
            throw err
        }
    }

    // ==========================================================================
    // VALUE CRUD 
    // ==========================================================================

    /**
     * 取得 table 中的其中一格
     * @param rowId 
     * @param columnId 
     */
    static async getValueByRowIdAndColumnId(rowId: string, columnId: string) {
        try {
            const value = await ValueModel.findOne({ belongRowId: rowId, belongColumnId: columnId });
            console.log(`DATABASE LOG: getValueByRowIdAndColumnId ,rowId = ${rowId},columnUd = ${columnId},value = ${value}`)
            return value;
        } catch (err) {
            throw err;
        }
    }

    /**
     * 取得一列 row 上的 values
     * @param rowId 
     */
    static async getValuesByRowId(rowId: string) {
        try {
            const values = await ValueModel.find({ belongRowId: rowId });
            console.log(`DATABASE LOG: getValuesByRowId ,rowId = ${rowId},value = ${values}`)
            return values;
        } catch (err) {
            throw err;
        }
    }

    /**
     * 取得一行 column 上的 values
     * @param columnId 
     */
    static async getValuesByColumnId(columnId: string) {
        try {
            const values = await ValueModel.find({ belongColumnId: columnId });
            return values;
        } catch (err) {
            throw err;
        }
    }

    /**
     * 取得整張表的資料
     * @param tableId 
     */
    static async getValuesByTableId(tableId: string) {

        interface ResponseRowSchema {
            rowId: string,
            [key: string]: any
        }

        const cols = await ColumnModel.find({ belongTableId: tableId })
        const rows = await RowModel.find({ belongTableId: tableId });
        const data: Array<ResponseRowSchema> = [];

        for (const row of rows) {
            const rowData: ResponseRowSchema = {
                rowId: row.id
            }
            for (const col of cols) {
                const value = await ValueModel.findOne({ belongColumnId: col.id, belongRowId: row.id });
                rowData[col.name] = value?.data
            }
            data.push(rowData)
        }
        console.log(`DATABASE LOG: getValuesByTableId ,tableId = ${tableId},data = ${data}`)
        return data
    }

    /**
     * 新增其中一格資料
     * @param rowId 
     * @param columnId 
     */
    static async createValue(value: InsertOrUpdateValueDto) {
        try {
            const newValue = await ValueModel.create(value);
            await newValue.save();
            console.log(`DATABASE LOG: createValue ,value = ${value}`)
            return newValue;
        } catch (err) {
            throw err;
        }
    }

    /**
     * 在 talbe 中新增一列資料
     * @param tableId 
     * @param data 
     */
    static async createNewRowOfValuesInTableByTableId(tableId: string, data: { [key: string]: any }) {
        try {
            const cols = await ColumnModel.find({ belongTableId: tableId });

            const newRow = await this.createRow({
                belongTableId: tableId
            })

            //for each col
            for (const col of cols) {
                await this.createValue({
                    belongRowId: newRow.id,
                    belongColumnId: col.id,
                    data: data[col.name]
                })
            }
            console.log(`DATABASE LOG: createNewRowOfValuesInTableByTableId ,tableId = ${tableId},data = ${data}`)
        } catch (err) {
            throw err;

        }
    }


    /**
     * 更新其中一格的資料
     * @param value 
     */
    static async updateValue(value: InsertOrUpdateValueDto) {
        try {
            await ValueModel.updateOne({ belongRowId: value.belongRowId, belongColumnId: value.belongColumnId }, { data: value.data })
            console.log(`DATABASE LOG: updateValue ,value = ${value}`)
        } catch (err) {
            throw err
        }
    }


    /**
     * 更新一個 row 的資料 by tableId、rowId
     * @param tableId 
     * @param rowId 
     * @param data 
     */
    static async updateRowOfValuesInTableByTableIdAndRowId(tableId: string, rowId: string, data: { [key: string]: any }) {
        try {
            const cols = await ColumnModel.find({ belongTableId: tableId });
            for (const col of cols) {
                await ValueModel.updateOne({ belongRowId: rowId, belongColumnId: col.id }, { data: data[col.name] })
            }
            console.log(`DATABASE LOG: updateRowOfValuesInTableByTableIdAndRowId ,tableId = ${tableId},rowId = ${rowId},data = ${data}`)
        } catch (err) {
            throw err;
        }
    }



    /**
     * 刪除 value, 只要 columnId 或是 rowId 有對就會被刪掉
     * @param columnId 
     * @param rowId 
     */
    static async deleteTableValue(columnId: string | null, rowId: string | null) {
        if (!columnId && !rowId) throw new Error("columnId 或 rowId 至少需要提供一個");

        try {
            if (columnId) await ValueModel.deleteMany({ belongColumnId: columnId })
            if (rowId) await ValueModel.deleteMany({ belongRowId: rowId })
            if (columnId && rowId) await ValueModel.deleteMany({ belongColumnId: columnId, belongRowId: rowId })

            console.log(`DATABASE LOG: deleteTableValue ,columnId = ${columnId},rowId = ${rowId}`)

        } catch (err) {
            throw err
        }
    }
}

export { DatabaseService }