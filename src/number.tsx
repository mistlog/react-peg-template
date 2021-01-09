import { ReactPeg } from "react-peg";

export function Number() {
    const digits = (
        <repeat type="+">
            <set>0-9</set>
        </repeat>
    );

    const action = ({ globalFunction }) => {
        return parseFloat(globalFunction.text());
    }

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