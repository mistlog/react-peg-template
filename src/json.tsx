import { ReactPeg } from "react-peg";

let result = null;

try {
    const parser = ReactPeg.render(<JSONText />);
    const text = JSON.stringify({ a: 1, b: "text", c: null, d: [1, "a", { nested: { a: 1, b: "text", c: null } }] });
    const ast = parser.parse(text);
    result = ast;
} catch (error) {
    result = error;
}

console.log(result);

/**
 * grammar
 */
function JSONText() {
    return (
        <pattern action={({ value }) => value}>
            <_ />
            <Value label="value" />
            <_ />
        </pattern>
    );
}

function _() {
    return (
        <repeat type="*">
            <set> \t\n\r</set>
        </repeat>
    );
}

function Value() {
    return (
        <or>
            <pattern action={() => false}>
                <text>false</text>
            </pattern>
            <pattern action={() => null}>
                <text>null</text>
            </pattern>
            <pattern action={() => true}>
                <text>true</text>
            </pattern>
            <ObjectValue />
            <Array />
            <Number />
            <String />
        </or>
    );
}

function Number() {
    const digits = (
        <repeat type="+">
            <set>0-9</set>
        </repeat>
    );

    const action = ({ globalFunction }) => {
        return parseFloat(globalFunction.text());
    };

    return (
        <pattern action={action}>
            {digits}
            <opt>
                <text>.</text>
                {digits}
            </opt>
        </pattern>
    );
}

//
function String() {
    return (
        <pattern action={({ chars }) => chars.join("")}>
            <QuotationMark />
            <repeat type="*" label="chars">
                <Char />
            </repeat>
            <QuotationMark />
        </pattern>
    );
}

function Char() {
    return <Unescaped />;
}

function QuotationMark() {
    return <text>"</text>;
}

function Unescaped() {
    // https://stackoverflow.com/questions/43516938/hexadecimal-search-by-js-test-function-and-replacing-it-with-some-value
    // matches ASCII characters with hex codes from 00 till 1F (control chars) and also a 22 and 5C chars (" and \ respectively).
    return <set>^\0-\x1F\x22\x5C</set>;
}

//
function BeginArray() {
    return (
        <list>
            <_ />
            <text>[</text>
            <_ />
        </list>
    )
}

function EndArray() {
    return (
        <list>
            <_ />
            <text>]</text>
            <_ />
        </list>
    )
}

function ValueSeparator() {
    return (
        <list>
            <_ />
            <text>,</text>
            <_ />
        </list>
    )
}

function Array() {
    return (
        <pattern action={(({ head, tail }) => {
            return [head, ...tail];
        })}>
            <BeginArray />
            <Value label="head" />
            <repeat type="*" label="tail">
                <pattern action={({ value }) => value}>
                    <ValueSeparator />
                    <Value label="value" />
                </pattern>
            </repeat>
            <EndArray />
        </pattern>
    )
}

//
function BeginObject() {
    return (
        <list>
            <_ />
            <text>{`{`}</text>
            <_ />
        </list>
    )
}

function EndObject() {
    return (
        <list>
            <_ />
            <text>{`}`}</text>
            <_ />
        </list>
    )
}

function ObjectValue() {
    return (
        <pattern action={(({ head, tail }) => {
            return [head, ...tail].reduce((prev, curr) => {
                prev[curr.name] = curr.value;
                return prev;
            }, {});
        })}>
            <BeginObject />
            <Member label="head" />
            <repeat type="*" label="tail">
                <pattern action={({ value }) => value}>
                    <ValueSeparator />
                    <Member label="value" />
                </pattern>
            </repeat>
            <EndObject />
        </pattern>
    )
}

function NameSeparator() {
    return (
        <list>
            <_ />
            <text>:</text>
            <_ />
        </list>
    )
}

function Member() {
    return (
        <pattern action={({ name, value }) => ({ name, value })}>
            <String label="name" />
            <NameSeparator />
            <Value label="value" />
        </ pattern>
    )
}
