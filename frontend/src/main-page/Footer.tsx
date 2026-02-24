import React from "react";
import { Group, Text, Link } from "@chakra-ui/react";
import { FooterText } from "../translations/general";

const Footer: React.FC = () => {
  return (
    <div className="footer flex flex-col items-center justify-center py-10 px-4 text-base text-grey-700">
      <Group className="flex flex-col p-2">
        <Text>
          {FooterText.C4C_Motto}
          <Link className="font-medium" variant="underline" href={FooterText.C4C_Link}>
            {FooterText.C4C}
          </Link>{" "}
          for{" "}
          <Link className="font-medium" variant="underline" _hover={{color: "var(--color-primary-900)"}}  href={FooterText.Org_Link}>
            {FooterText.Org}
          </Link>
        </Text>
        <Text className="text-sm text-grey-600">{FooterText.NEU}</Text>
      </Group>
    </div>
  );
};

export default Footer;
