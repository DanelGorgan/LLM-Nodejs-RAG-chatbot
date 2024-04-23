import { Body, Controller, Post } from '@nestjs/common';
import { OpenAIService } from './openai.service';
import { OpenAIDTO } from '../../dto/openai.dto';

@Controller('/openai')
export class OpenAIController {
    constructor(private readonly openAIService: OpenAIService) {}

    @Post()
    generate(@Body() payload: OpenAIDTO) {
        return this.openAIService.generate(payload.msg);
    }
}
