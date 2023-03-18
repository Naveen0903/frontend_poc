import { useMachine } from "@zag-js/react";
import { MachineOptions, machine } from "./machine";
import { ComponentProps } from "react";

type LabelProps = ComponentProps<'label'> & { "data-part": string };
type InputProps = ComponentProps<'input'> & { "data-part": string };

export function useOtpInput(options: MachineOptions) {
    const [state, send] = useMachine(machine(options));
    const value = state.context.value;
    const name = state.context.name;
    const valueString = value.join("");

    return {
        value,
        valueString,
        getLabelProps(): LabelProps {
            return {
                "data-part": "label",
                onClick() {
                    send({ type: "LABEL_CLICK" })
                }
            }
        },
        getHiddenInputProps(): InputProps {
            return {
                "data-part": "hidden-input",
                name,
                type: "hidden",
                value: value.join("")
            }
        },
        getInputProps({ index }: {index: number}): InputProps {
            return {
                "data-part": "input",
                value: value[index],
                maxLength: 2,
                onChange(e) {
                    send({ type: "INPUT", index, value: e.target.value });
                },
                onFocus(e) {
                    send({ type: "FOCUS", index })
                },
                onBlur(e) {
                    send({ type: "BLUR" })
                },
                onKeyDown(e) {
                    const { key } = e;
                    if (key === "Backspace") {
                        send({ type: "BACKSPACE", index });
                    }
                },
                onPaste(e) {
                    e.preventDefault();
                    const value = e.clipboardData.getData("Text");
                    send({ type: "PASTE", value, index });
                }
            };
        }
    };
}