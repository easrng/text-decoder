import { render, h, htm, _labels, decode, useState, useRef } from "https://easrng.github.io/text-decoder/deps.bundle.js";
const labels = [
  "hex",
  ..._labels.filter((e) => e !== "unicode" && e !== "hex" && e !== "base64"),
];
import { Buffer } from "https://jspm.dev/@jspm/core@2/nodelibs/buffer";
const html = htm.bind(h);
function Decodings({ data }) {
  const decodings = {};
  for (const label of labels) {
    let decodesAs;
    try {
      decodesAs = decode(data, label);
    } catch (e) {
      console.warn("failed to decode as " + label + ":", e);
      decodesAs = "decoding failed";
    }
    if (!decodings[decodesAs]) decodings[decodesAs] = [];
    decodings[decodesAs].push(label);
  }
  return html`<dl>
    ${Object.entries(decodings).map(
      ([decodesAs, labels]) =>
        html`<dt>
            ${decodesAs == "decoding failed"
              ? decodesAs
              : html`<span class="text">${decodesAs}</span>
                  <span class="codepoints">
                    ${[...decodesAs]
                      .map((e) => "U+" + e.codePointAt(0).toString(16))
                      .join(" ")
                      .toUpperCase()}
                  </span>`}
          </dt>
          <dd>
            <ul>
              ${labels.map((e) => html`<li>${e}</li>`)}
            </ul>
          </dd>`
    )}
  </dl>`;
}
const zero = Buffer.alloc(0);
function App() {
  const [data, setData] = useState(zero);
  const hexInput = useRef();
  return html`
    <h1>text decoder</h1>
    <input
      type="text"
      ref=${hexInput}
      pattern=${String.raw`^([\\0]x|\s|[a-fA-F0-9])*$`}
      title="hex"
      placeholder="hex data"
      onInput=${(e) => {
        e.preventDefault();
        if (hexInput.current.validity.valid) {
          let newHex = hexInput.current.value.replace(/[\\\\0]x|\s/g, "");
          newHex += "0".repeat(newHex.length % 2);
          setData(Buffer.from(newHex, "hex"));
        } else {
          setData(null);
        }
      }}
    />
    <p>
      ${data
        ? data.length
          ? html`<${Decodings} data=${data} />`
          : html`<dt>supported encodings</dt>
              <dd>
                <ul>
                  ${labels.map((e) => html`<li>${e}</li>`)}
                </ul>
              </dd>`
        : html`invalid hex data`}
    </p>
    <footer>
      <hr />
      <p>
        yet another site by <a href="https://easrng.net/">easrng</a>${" • powered by "}
        <a href="https://www.npmjs.com/package/legacy-encoding">
          legacy-encoding
        </a>
      </p>
    </footer>
  `;
}
render(html`<${App} />`, document.body);
