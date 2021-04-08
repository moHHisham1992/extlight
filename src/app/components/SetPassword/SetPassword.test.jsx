import React from "react";
import renderer from "react-test-renderer";

import SetPassword from "./index";

test("Link changes the class when hovered", () => {
  const handlePasswordModalOk = () => {
    console.log("handlePasswordModalOk");
  };
  const component = renderer.create(
    <SetPassword visible={false} onOk={handlePasswordModalOk}></SetPassword>
  );

  const tree = component.toTree();
  expect(tree.rendered.props.title).toEqual("Your Password");
});
