import { Button } from "@mui/material";
import { Link, NavLink } from "react-router-dom";

export default function HomePage() {
  try {
    return (
      <>
        <NavLink
          to="/radicals"
        >
          <Button>
            rads
          </Button>
        </NavLink>

        <NavLink
          to="/rubytool"
        >
          <Button>
            ruby tool
          </Button>
        </NavLink>

        <NavLink
          to="/syllabary"
        >
          <Button>
            syllabary
          </Button>
        </NavLink>
      </>
    )
  } catch (e) {
  }

}
