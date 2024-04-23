import { DynamicModule, Logger, Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from '../config/database.config';
import { TypeORMVectorStore } from '@langchain/community/vectorstores/typeorm';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { CharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from '@langchain/openai';
import { VECTORDB } from 'src/config/constants';
import pg from 'pg';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions.js';

@Module({})
export class VectorDBModule {
    private static readonly logger = new Logger(VectorDBModule.name);
    static register(): DynamicModule {
        const vectorDBProvider: Provider<TypeORMVectorStore> = {
            provide: VECTORDB,
            inject: [ConfigService],
            useFactory: async (
                configService: ConfigService,
            ): Promise<TypeORMVectorStore> => {
                const args = {
                    postgresConnectionOptions: {
                        ...configService.get('database'),
                    } as PostgresConnectionOptions,
                };

                this.logger.debug('vectorDB init START');

                const vectordb = await TypeORMVectorStore.fromDataSource(
                    new OpenAIEmbeddings({
                        openAIApiKey:
                            configService.get<string>('OPENAI_API_KEY'),
                    }),
                    args,
                );

                await vectordb.ensureTableInDatabase();

                const initialized = await this.isInitialized(
                    args.postgresConnectionOptions,
                );

                this.logger.debug('vectorDB init DONE');

                if (!initialized) {
                    const docs = await this.getChunks();
                    const vectorDBDocuments = docs.map((doc) => ({
                        pageContent: doc.pageContent,
                        metadata: doc.metadata,
                    }));

                    await vectordb.addDocuments(vectorDBDocuments);

                    this.logger.debug('VectorDB got populated');
                }

                return vectordb;
            },
        };

        return {
            module: VectorDBModule,
            imports: [ConfigModule.forFeature(databaseConfig)],
            providers: [vectorDBProvider],
            exports: [vectorDBProvider],
        };
    }

    static async isInitialized(connection: PostgresConnectionOptions) {
        const pool = new pg.Pool({
            host: connection.host,
            port: connection.port,
            user: connection.username,
            password: connection.password,
            database: connection.database,
        });

        const count = await pool.query('SELECT count(*) from documents');

        return !!parseInt(count.rows[0].count);
    }

    static async getChunks() {
        const pdfFileUrl = 'src/util/1706.03762.pdf';
        const loader = new PDFLoader(pdfFileUrl);

        const textSplitter = new CharacterTextSplitter({
            separator: '\n',
            chunkSize: 1000,
            chunkOverlap: 50,
            lengthFunction: (str) => str.length,
        });

        return await loader.loadAndSplit(textSplitter);
    }
}
