import { Module } from '@nestjs/common';
import { OpenAIService } from './openai.service';
import { OpenAIController } from './openai.controller';
import { VectorDBModule } from '../../vectordb/vectordb.module';

@Module({
    imports: [VectorDBModule.register()],
    controllers: [OpenAIController],
    providers: [OpenAIService],
})
export class OpenAIModule {}
