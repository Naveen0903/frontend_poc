import { createMachine } from "@zag-js/core";

// state
type MachineState = {
    value: "idle" | "focused"
}

// context
type MachineContext = {
    name: string;
    value: string[];
    focusedIndex: number;
    readonly isCompleted: boolean;
    onComplete?: (value: string[]) => void;
};

export type MachineOptions = {
    name: string;
    value?: string[];
    onComplete?: (value: string[]) => void;
    numOfFields: number;
}

export function machine(options: MachineOptions) {
    const { numOfFields, ...rest } = options
    return createMachine<MachineContext, MachineState>({
        id: "otp-input",
        initial: "idle",
        context: {
            ...rest,
            value: Array.from<string>({ length: numOfFields }).fill(""),
            focusedIndex: -1
        },
        computed: {
            isCompleted(ctx) {
                return ctx.value.every(value => value !== "");
            }
        },
        watch: {
            focusedIndex: ["executeFocus"],
            isCompleted: ["invokeOnComplete"]
        },
        states: {
            idle: {
                on: {
                    // When input is focused, change input state to focused state and save the input index.
                    FOCUS: {
                        target: "focused",
                        actions: ["setFocusedIndex"]
                    },
                    LABEL_CLICK: {
                        actions: ["focusFirstInput"]
                    }
                }
            },
            focused: {
                on: {
                    // When clicked outside, change input state to idle and reset index.
                    BLUR: {
                        target: "idle",
                        actions: ["clearFocusedIndex"]
                    },
                    // When value is entered, save the value and move to next input.
                    INPUT: {
                        actions: ["setFocusedValue", "focusNextInput"]
                    },
                    // When backspace is pressed, clear the value of current input and move to previous input.
                    BACKSPACE: {
                        actions: ["clearFocusedValue", "focusPreviousInput"]
                    },
                    // When values are copy pasted, spread values accross multiple inputs and focus on last input.
                    PASTE: {
                        actions: ["setPastedValue", "focusLastEmptyInput"]
                    }
                }
            }
        },
    }, {
        actions: {
            setFocusedIndex(context, event) {
                context.focusedIndex = event.index;
            },
            clearFocusedIndex(context) {
                context.focusedIndex = -1;
            },
            setFocusedValue(context, event) {
                const eventValue: string = event.value;
                const focusedValue = context.value[context.focusedIndex];
                const nextValue = getNextValue(focusedValue, eventValue);
                context.value[context.focusedIndex] = nextValue;
            },
            clearFocusedValue(context) {
                context.value[context.focusedIndex] = "";
            },
            focusFirstInput(context) {
                context.focusedIndex = 0;
            },
            focusPreviousInput(context) {
                const previousIndex = Math.max(0, context.focusedIndex - 1);
                context.focusedIndex = previousIndex;
            },
            focusNextInput(context, event) {
                const nextIndex = Math.min(
                    context.focusedIndex + 1,
                    context.value.length - 1
                );
                context.focusedIndex = nextIndex;
            },
            executeFocus(context) {
                const inputGroup = document.querySelector("[data-part=input-group]");
                if (!inputGroup || context.focusedIndex === -1) return;
                const inputElement = Array.from(inputGroup.querySelectorAll<HTMLInputElement>("[data-part=input]"));
                const input = inputElement[context.focusedIndex];
                requestAnimationFrame(() => {
                    input?.focus();
                });
            },
            setPastedValue(context, event) {
                const pastedValue: string[] = event.value.split("").slice(0, context.value.length);
                pastedValue.forEach((value, index) => {
                    context.value[index] = value;
                });
            },
            focusLastEmptyInput(context) {
                const index = context.value.findIndex(value => value === "");
                const lastIndex = context.value.length - 1;
                context.focusedIndex = (index === -1) ? lastIndex : index;
            },
            invokeOnComplete(context) {
                if (!context.isCompleted) return;
                context.onComplete?.(Array.from(context.value));
            }
        }
    })
};

function getNextValue(focusedValue: string, eventValue: string) {
    let nextValue = eventValue;
    if (focusedValue[0] === eventValue[0]) {
        nextValue = eventValue[1];
    } else if (focusedValue[0] === eventValue[1]) {
        nextValue = eventValue[0];
    }

    return nextValue;
}