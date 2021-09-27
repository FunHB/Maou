import { Connection, ConnectionManager, EntityTarget, FindConditions } from 'typeorm'
import { Config } from '../config'
import { ChannelEntity } from './entity/Channel'
import { MessageEntity } from './entity/Message'
import { PenaltyEntity } from './entity/Penalty'
import { ReportEntity } from './entity/Report'
import { RoleEntity } from './entity/Role'
import { UserEntity } from './entity/User'

export class DatabaseManager {
    public static connection: Connection
    public static connectionManager: ConnectionManager

    public static async connect(): Promise<void> {
        const config = new Config()
        console.info('[Database Manager] Connecting to database')

        this.connectionManager = new ConnectionManager()

        this.connection = this.connectionManager.create({
            name: 'ene',
            type: 'postgres',
            url: config.databaseString,
            synchronize: true,
            entities: [
                ChannelEntity,
                PenaltyEntity,
                ReportEntity,
                RoleEntity,
                UserEntity,
                MessageEntity
            ]
        })

        await this.connection.connect()
    }

    public static async getEntity<T>(target: EntityTarget<T>, filter?: FindConditions<T>): Promise<T> {
        return await this.connection.createEntityManager().findOne(target, filter)
    }

    public static async getEntities<T>(target: EntityTarget<T>, filter?: FindConditions<T>): Promise<T[]> {
        return await this.connection.createEntityManager().find(target, filter)
    }

    public static async save<T>(entity: T): Promise<void> {
        await this.connection.createEntityManager().save(entity)
    }

    public static async remove<T>(entity: T): Promise<void> {
        await this.connection.createEntityManager().remove(entity)
    }
}