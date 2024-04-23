class CustomDeque<T> extends Array<T> {
    constructor(...args: T[]) {
        super(...args);
    }

    toString(): string {
        if (this.length === 0) {
            return '';
        } else {
            return this.join('');
        }
    }
}

// Other examples: https://js.langchain.com/docs/modules/memory/
export class CustomChatBufferHistory {
    public memory: CustomDeque<string>;
    private k: number;
    private human_prefix_start: string;
    private human_prefix_end: string;
    private ai_prefix_start: string;
    private ai_prefix_end: string;

    constructor(
        human_prefix_start = 'Human:',
        human_prefix_end = '',
        ai_prefix_start = 'AI:',
        ai_prefix_end = '',
    ) {
        this.memory = new CustomDeque<string>();
        this.k = 2;
        this.human_prefix_start = human_prefix_start;
        this.human_prefix_end = human_prefix_end;
        this.ai_prefix_start = ai_prefix_start;
        this.ai_prefix_end = ai_prefix_end;
    }

    cleanMemory(): void {
        this.memory = new CustomDeque<string>();
    }

    updateHistory(humanQuery: string, aiResponse: string): void {
        const entry =
            `\n${this.human_prefix_start} ${humanQuery} ${this.human_prefix_end}` +
            `\n${this.ai_prefix_start} ${aiResponse} ${this.ai_prefix_end}`;

        this.memory.push(entry);
        if (this.memory.length > this.k) {
            this.memory.shift();
        }
    }
}
