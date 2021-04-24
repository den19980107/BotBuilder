import { Application, Request, Response } from "express";
import Route from "./route";
import config from '../../config/server.json'
import ColumnModel from "../models/database/column.model";
import TableModel from "../models/database/table.model";
import RowModel from "../models/database/row.model";
import ValueModel from "../models/database/value.model";

import { DatabaseService } from '../service/databaseService'

class DatabaseRoute extends Route {

    protected registerRoutes(app: Application) {
        app.get(`${config.API_PREFIX_URL}/database/table`, this.authenticateToken, this.getTablesByUserId)
        app.post(`${config.API_PREFIX_URL}/database/table/create`, this.authenticateToken, this.createTable)
        app.post(`${config.API_PREFIX_URL}/database/table/update/:id`, this.authenticateToken, this.updateTable)
        app.post(`${config.API_PREFIX_URL}/database/table/delete/:id`, this.authenticateToken, this.deleteTable)

        app.get(`${config.API_PREFIX_URL}/database/table/:tableId/column`, this.authenticateToken, this.getColumnsByTableId)
        app.post(`${config.API_PREFIX_URL}/database/table/:tableId/column/create`, this.authenticateToken, this.createColumn)
        app.post(`${config.API_PREFIX_URL}/database/table/:tableId/column/update/:id`, this.authenticateToken, this.updateColumn)
        app.post(`${config.API_PREFIX_URL}/database/table/:tableId/column/delete/:id`, this.authenticateToken, this.deleteColumn)

        app.get(`${config.API_PREFIX_URL}/database/customTable/:tableId/data`, this.authenticateToken, this.getTableData)
        app.post(`${config.API_PREFIX_URL}/database/customTable/:tableId/data/create`, this.authenticateToken, this.insertTableData)
        app.post(`${config.API_PREFIX_URL}/database/customTable/:tableId/data/update`, this.authenticateToken, this.updateTableData)
        app.post(`${config.API_PREFIX_URL}/database/customTable/:tableId/data/delete`, this.authenticateToken, this.deleteTableData)
    }

    private async getTablesByUserId(req: Request, res: Response) {
        try {
            const userId = req.user.id;
            const tables = await DatabaseService.getTablesByUserId(userId)
            res.json(tables)
        } catch (err) {
            res.status(500).json({ err })
        }
    }

    private async createTable(req: Request, res: Response) {
        const userId = req.user.id;
        const { name } = req.body;
        if (!name) {
            res.status(400).json({ msg: "no table name provided!" });
            return
        }
        try {
            await DatabaseService.createTable({
                name,
                belongUserId: userId
            })
            res.sendStatus(200);
        } catch (err) {
            res.status(500).json({ err });
        }
    }

    private async updateTable(req: Request, res: Response) {
        const tableId = req.params.id;
        if (!tableId) {
            res.status(400).json({ msg: "tableId is empty" });
            return;
        }
        const { name } = req.body;
        if (!name) {
            console.log(name);
            res.status(400).json({ msg: "name is empty" });
            return;
        }
        try {
            await TableModel.findByIdAndUpdate(tableId, { name });
            res.sendStatus(200);
        } catch (err) {
            res.status(500).json({ err });
        }
    }

    private async deleteTable(req: Request, res: Response) {
        const tableId = req.params.id;
        if (!tableId) {
            res.status(400).json({ msg: "tableId is empty" });
            return;
        }
        try {
            await DatabaseService.deleteTableByTableId(tableId)
        } catch (err) {
            res.status(500).json({ err });
        }
    }

    private async getColumnsByTableId(req: Request, res: Response) {
        try {
            const { tableId } = req.params
            const columns = await DatabaseService.getColumnsByTableId(tableId);
            res.json(columns)
        } catch (err) {
            res.status(500).json({ err })
        }
    }

    private async createColumn(req: Request, res: Response) {
        const { tableId } = req.params
        const { name, displayName, require, dataType } = req.body;
        if (!tableId) {
            res.status(400).json({ msg: "table id or col id not provided" });
            return
        }
        try {
            await DatabaseService.createColumn({
                belongTableId: tableId,
                name,
                displayName,
                require,
                dataType
            })

            res.sendStatus(200);
        } catch (err) {
            console.error(err);
            res.status(500);
        }
    }

    private async updateColumn(req: Request, res: Response) {
        const { tableId, id } = req.params;
        const { name, displayName, require, dataType } = req.body;
        if (!tableId) {
            res.status(400).json({ msg: "tableId is empty" });
            return;
        }
        if (!name || !displayName || !require || !dataType) {
            console.log(name);
            res.status(400).json({ msg: "name or displayName or require or dataType is empty" });
            return;
        }
        try {
            await DatabaseService.updateColumn(id, { name, displayName, require, dataType, belongTableId: tableId })
            res.sendStatus(200);
        } catch (err) {
            res.status(500).json({ err });
        }
    }

    private async deleteColumn(req: Request, res: Response) {
        const { tableId, id } = req.params;
        if (!tableId || !id) {
            res.status(400).json({ msg: "tableId or id is empty" });
            return;
        }
        try {
            await DatabaseService.deleteColumnAndValueByColumnId(id);
            res.sendStatus(200)
        } catch (err) {
            res.status(500).json({ err });
        }
    }

    private async getTableData(req: Request, res: Response) {
        try {
            const { tableId } = req.params;
            const data = await DatabaseService.getValuesByTableId(tableId)
            res.status(200).json(data);
        } catch (err) {
            res.status(500).json({ err })
        }
    }

    private async insertTableData(req: Request, res: Response) {
        try {
            const { tableId } = req.params;
            const { data } = req.body;
            await DatabaseService.createNewRowOfValuesInTableByTableId(tableId, data)
            res.sendStatus(200);
        }
        catch (err) {
            res.status(500).json({ err })
        }
    }

    private async updateTableData(req: Request, res: Response) {
        try {
            const { tableId } = req.params;
            const { rowId, value } = req.body;
            await DatabaseService.updateRowOfValuesInTableByTableIdAndRowId(tableId, rowId, value)
            res.sendStatus(200);
        } catch (err) {
            res.status(500).json({ err })
        }
    }

    private async deleteTableData(req: Request, res: Response) {
        try {
            const { rowId } = req.body;
            await DatabaseService.deleteRowAndValueByRowId(rowId);
            res.sendStatus(200)
        } catch (err) {
            res.status(500).json({ err })
        }
    }

}


export default DatabaseRoute;