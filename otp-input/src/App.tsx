import "./App.css";
import { useOtpInput } from "./use-otp-input";

function App() {
  const { value, valueString, getHiddenInputProps, getInputProps, getLabelProps } = useOtpInput({
    numOfFields: 4,
    name: "otp",
    onComplete(value) {
      console.log(value);
    }
  });
  return (
    <div className="App">
      <form onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        console.log(formData.get("otp"));
      }}>
        {/* <pre>{JSON.stringify({ value, focusedIndex, event: type, context: state.context })}</pre> */}
        <div data-part="container">
          <label {...getLabelProps()}>Enter OTP</label>
          <input {...getHiddenInputProps()} />
          <div data-part="input-group">
            {value.map((_, index) => (
              <input
                key={index}
                {...getInputProps({ index })}
              />
            ))}
          </div>
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default App;
