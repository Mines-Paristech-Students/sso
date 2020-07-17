import React from "react";
import MainContainer from "./MainContainer";
import { Link } from "react-router-dom";

export default function Error404() {
  return (
    <MainContainer heading={"404."}>
      <p>
        T’as essayé <Link to="/admin/">/admin/</Link> ?
      </p>
    </MainContainer>
  );
}
