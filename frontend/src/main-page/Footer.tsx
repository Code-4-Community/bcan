import React from "react";
import "../styles/Footer.css";
import { Group, Text, Link } from "@chakra-ui/react";
import { FooterText } from "../translations/general";

const Footer: React.FC = () => {
  return (
    <div className="footer">
      <Group className="text-block">
        <Text>
          {FooterText.C4C_Motto}
          <Link variant="underline" href={FooterText.C4C_Link}>
            {FooterText.C4C}
          </Link>{" "}
          for{" "}
          <Link variant="underline" _hover={{color: "var(--color-primary-900)"}}  href={FooterText.Org_Link}>
            {FooterText.Org}
          </Link>
        </Text>
        <Text className="northeastern-uni-caption">{FooterText.NEU}</Text>
      </Group>
    </div>
  );
};

export default Footer;
