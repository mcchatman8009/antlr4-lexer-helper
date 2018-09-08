import {ActionContext, LineInfo, Rule} from 'text-tokenizer';
import {CommonToken, Lexer, Token} from 'antlr4';
import {AntlrTokenizer} from './antlr-tokenizer';

export class AntlrActionContext {
    private actionContext: ActionContext;
    private rule: Rule;

    constructor(private tokenizer: AntlrTokenizer) {
    }

    info(): LineInfo {
        return this.actionContext.info();
    }

    setRule(rule: Rule) {
        this.rule = rule;
    }

    getRule(): Rule {
        return this.rule;
    }

    setActionContext(actionContext: ActionContext) {
        this.actionContext = actionContext;
    }

    setState(state: string) {
        this.actionContext.state(state);
    }

    getState(): string {
        return this.actionContext.state();
    }

    push(state: string) {
        this.actionContext.push(state);
    }

    pop(): string {
        return this.actionContext.pop();
    }

    repeatMatch() {
        this.actionContext.repeat();
    }

    stopConsuming() {
        this.actionContext.stop();
    }

    ignoreToken() {
        this.actionContext.ignore();
        const info = this.actionContext.info();

        this.tokenizer.line = info.line;
        this.tokenizer.column = info.column - 1;

        this.consumeInput(info.len);
    }

    acceptToken(type: number, text = '', position?: number) {
        this.actionContext.accept(type);
        this.addToken(type, text, position);
    }

    rejectToken() {
        this.actionContext.reject();
    }

    addEOF() {
        if (this.tokenizer.getTokens().length === 1 && this.tokenizer.getTokens()[0].type === Token.EOF) {
            return;
        } else if (this.tokenizer.getTokens().length === 0) {

            // this.tokenizer.line = info.line;
            // this.tokenizer.column = info.column - 1;

            const token = this.createToken(Token.EOF, 0, 1, 'EOF');
            this.tokenizer.getTokens().push(token);
        } else {
            const info = this.actionContext.info();

            this.tokenizer.line = info.line;
            this.tokenizer.column = info.column - 1;

            const token = this.createToken(Token.EOF, info.pos, info.pos + info.len - 1, 'EOF');
            this.tokenizer.getTokens().push(token);
        }


    }

    private addToken(type: number, text = '', position?: number) {
        const info = this.actionContext.info();

        this.tokenizer.line = info.line;
        this.tokenizer.column = info.column - 1;

        this.consumeInput(info.len);

        const token = this.createToken(type, info.pos, info.pos + info.len - 1, text);

        if (position) {
            this.tokenizer.getTokens().splice(position, 0, token);
        } else {
            this.tokenizer.getTokens().push(token);
        }
    }

    private createToken(type: number, start: number, stop: number, text = ''): Token {
        const lexer = this.tokenizer.lexer as any;

        const token = new CommonToken(lexer._tokenFactorySourcePair, type, Lexer.DEFAULT_TOKEN_CHANNEL, start, stop);

        if (text.length > 0) {
            (token as any).text = text;
        } else {
            (token as any).text = this.tokenizer.getInputStream().getText(start, stop);
        }

        return token;
    }

    private consumeInput(len: number) {
        for (let i = 0; i < len; i++) {
            this.tokenizer.getInputStream().consume();
        }
    }
}
