import { Inject, Injectable, Logger } from '@nestjs/common';
import { OpenAI } from '@langchain/openai';
import { CustomChatBufferHistory } from '../../util/custom_history';
import { VECTORDB } from 'src/config/constants';
import { TypeORMVectorStore } from '@langchain/community/vectorstores/typeorm';
import { ConfigService } from '@nestjs/config';
import { PromptTemplate } from '@langchain/core/prompts';

@Injectable()
export class OpenAIService {
    private readonly client: OpenAI;
    private readonly promptTemplate = `
    You are a helpful, respectful and honest assistant. You help to answer questions regarding 'Attention is all you need' article.

    Chat history: {chat_history}
  
    Context: {content}

    Question: {question}
  `;
    private readonly customChatHistory = new CustomChatBufferHistory(
        'Human:',
        'AI:',
    );
    private readonly logger = new Logger(OpenAIService.name);

    constructor(
        @Inject(VECTORDB) private readonly vectorDB: TypeORMVectorStore,
        private readonly configService: ConfigService,
    ) {
        this.client = new OpenAI({
            modelName: 'gpt-3.5-turbo',
            temperature: 1,
            openAIApiKey: this.configService.get<string>('OPENAI_API_KEY'),
        });
    }

    public async generate(input: string) {
        this.logger.debug(`Generating response for input: ${input}`);

        const searchResults = await this.vectorDB.similaritySearch(input, 3);
        let contentCombined = '';
        for (const result of searchResults) {
            contentCombined += result.pageContent + ' \n';
        }

        this.logger.debug(`VectorDB input: ${contentCombined}`);

        const prompt = await PromptTemplate.fromTemplate(
            this.promptTemplate,
        ).format({
            content: contentCombined,
            chat_history: this.customChatHistory.memory.toString(),
            question: input,
        });

        const response = await this.client.invoke(prompt);
        this.customChatHistory.updateHistory(input, response);
        this.logger.debug(`Response generated: ${response}`);

        return { response };
    }
}
