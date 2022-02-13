import { Box, HStack, useRadio, useRadioGroup } from "@chakra-ui/react";

export default function ColorSelector({
  options = [
    "#ffc8dd",
    "#a2d2ff",
    "#ff686b",
    "#ffc09f",
    "#b3e0a3",
    "#98f5e1",
    "#fea5be",
  ],
  setColor,
  color,
}: {
  options: string[];
  setColor: (color: string) => void;
  color: string;
}) {
  const { getRootProps, getRadioProps } = useRadioGroup({
    name: "Color",
    defaultValue: color,
    onChange: (value) => setColor(value),
  });
  const group = getRootProps();
  return (
    <>
      <HStack {...group}>
        {options.map((value) => {
          const radio = getRadioProps({ value });
          return <RadioCard key={value} color={value} {...radio} />;
        })}
      </HStack>
    </>
  );
}

function RadioCard(props: any) {
  const { getInputProps, getCheckboxProps } = useRadio(props);

  const input = getInputProps();
  const checkbox = getCheckboxProps();

  return (
    <Box as="label">
      <input {...input} />
      <Box
        {...checkbox}
        cursor="pointer"
        bgColor={props.color ? props.color : null}
        borderRadius="full"
        boxShadow={"dark-lg"}
        _checked={{
          borderColor: "blue.200",
          boxShadow: "lg",
          borderWidth: "medium",
          p: "2.5",
        }}
        _focus={{
          boxShadow: "outline",
        }}
        p={"2"}
      />
    </Box>
  );
}
