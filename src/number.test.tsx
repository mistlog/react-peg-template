import { ReactPeg } from "react-peg";
import { Number } from "./number";

test("parse number", () => {
    const parser = ReactPeg.render(<Number />);
    const ast = parser.parse("3.14");
    expect(ast).toEqual(3.14);
})