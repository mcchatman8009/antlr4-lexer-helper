import {InputStream, Lexer, Token} from 'antlr4';
import {TokenInterpreter} from './token-interpreter';

/**
 * A Safe Base Class Lexer
 */
export class SafeLexer extends Lexer {
    constructor(private input: InputStream) {
        super();
        Lexer.apply(this, arguments);
    }

    set inputStream(input: InputStream) {
        this.input = input;
    }

    get inputStream() {
        return this.input;
    }

    reset() {
        this.inputStream.reset();
    }

    setTokenInterpreter(interp: TokenInterpreter) {
        const self = this as any;
        self._interp = interp;
    }
}
