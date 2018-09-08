import {InputStream, Lexer, Token} from 'antlr4';
import {TextTokenizer} from 'text-tokenizer';
import {AntlrActionContext} from './antlr-action-context';
import {TokenInterpreter} from './token-interpreter';

export class AntlrTokenizer implements TokenInterpreter {
    column: number;
    line: number;

    private input: InputStream;
    private tokens: Array<Token>;
    private tokenizer: TextTokenizer;
    private actionCtx: AntlrActionContext;
    private tokenQueuePosition: number;

    constructor(input: InputStream, public readonly lexer: Lexer) {
        this.input = input;
        this.tokens = new Array<Token>(100000);
        this.tokenizer = new TextTokenizer();
        this.actionCtx = new AntlrActionContext(this);
    }

    setInputStream(input: InputStream) {
        this.input = input;
    }

    getInputStream(): InputStream {
        return this.input;
    }

    reset() {
        this.loadTokens();
    }

    addEOF() {
        this.actionCtx.addEOF();
    }

    beforeRule(callback: (ctx: AntlrActionContext, match: string[]) => void) {
        this.tokenizer.before((ctx, match: string[], rule) => {
            this.actionCtx.setRule(rule);
            this.actionCtx.setActionContext(ctx);

            callback(this.actionCtx, match);
        });
    }

    afterRule(callback: (ctx: AntlrActionContext, match: string[]) => void) {
        this.tokenizer.after((ctx, match: string[], rule) => {
            this.actionCtx.setRule(rule);
            this.actionCtx.setActionContext(ctx);

            callback(this.actionCtx, match);
        });
    }

    doneTokenizing(callback: (ctx: AntlrActionContext) => void) {
        this.tokenizer.finish((ctx) => {
            this.actionCtx.setRule(null);
            this.actionCtx.setActionContext(ctx);

            callback(this.actionCtx);
        });
    }

    tokenRule(pattern: RegExp, callback: (ctx: AntlrActionContext, match: string[]) => void) {
        this.tokenizer.rule(pattern, (ctx, match) => {
            this.actionCtx.setRule(null);
            this.actionCtx.setActionContext(ctx);

            callback(this.actionCtx, match);
        });
    }

    loadTokens() {
        this.tokenQueuePosition = 0;
        this.tokens.length = 0;
        this.column = 0;
        this.line = 1;
        this.tokenizer.input((this.input as any).strdata);
        this.tokenizer.tokens();
    }

    nextToken(): Token {
        return this.tokens[this.tokenQueuePosition++];
    }

    getTokens(): Token[] {
        return this.tokens;
    }
}
