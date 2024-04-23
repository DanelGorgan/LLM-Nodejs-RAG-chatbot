import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OpenAIModule } from './llm/openai/openai.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        OpenAIModule,
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'public'),
        }),
    ],
})
export class AppModule {}
