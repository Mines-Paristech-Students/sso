import React, { useState } from "react";
import MainContainer from "./MainContainer";
import Button from "react-bootstrap/Button";

export default function FakeAdmin() {
  /**
   * This is a troll.
   */

  const [buttonPushed, setButtonPushed] = useState<boolean>(false);

  return (
    <MainContainer heading="Administration">
      <Button variant="outline-danger" onClick={() => setButtonPushed(true)}>
        Passer en maintenance
      </Button>

      {buttonPushed && (
        <div className="troll">
          <span role="img" aria-label="émoticônes lol">
            😂😂😂
          </span>
        </div>
      )}
    </MainContainer>
  );
}
