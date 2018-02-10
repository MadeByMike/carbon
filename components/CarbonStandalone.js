import { EOL } from 'os'
import * as hljs from 'highlight.js'
import React from 'react'
import Spinner from 'react-spinner'
import ResizeObserver from 'resize-observer-polyfill'
import toHash from 'tohash'
import debounce from 'lodash.debounce'
import ms from 'ms'
import WindowControls from '../components/WindowControls'
import CodeMirror from '../lib/react-codemirror'
import {
  COLORS,
  DEFAULT_LANGUAGE,
  LANGUAGES,
  LANGUAGE_MODE_HASH,
  LANGUAGE_NAME_HASH
} from '../lib/constants'

const DEFAULT_SETTINGS = {
  paddingVertical: '50px',
  paddingHorizontal: '50px',
  marginVertical: '45px',
  marginHorizontal: '45px',
  dropShadowOffsetY: '20px',
  dropShadowBlurRadius: '68px',
  theme: 'seti',
  windowTheme: 'none',
  language: DEFAULT_LANGUAGE,
  fontFamily: 'Hack',
  fontSize: '22px'
}

class Carbon extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      loading: true,
      language: props.config.language
    }

    this.handleLanguageChange = this.handleLanguageChange.bind(this)
    this.codeUpdated = this.codeUpdated.bind(this)
  }

  componentDidMount() {
    this.setState({
      loading: false
    })

    this.handleLanguageChange(this.props.children)

    const ro = new ResizeObserver(entries => {
      const cr = entries[0].contentRect
      this.props.onAspectRatioChange(cr.width / cr.height)
    })
    ro.observe(this.exportContainerNode)
  }

  componentWillReceiveProps(newProps) {
    this.handleLanguageChange(newProps.children, { customProps: newProps })
  }

  codeUpdated(newCode) {
    this.handleLanguageChange(newCode)
    this.props.updateCode(newCode)
  }

  handleLanguageChange = debounce(
    (newCode, config) => {
      const props = (config && config.customProps) || this.props

      if (props.config.language === 'auto') {
        // try to set the language
        const detectedLanguage = hljs.highlightAuto(newCode).language
        const languageMode =
          LANGUAGE_MODE_HASH[detectedLanguage] || LANGUAGE_NAME_HASH[detectedLanguage]

        if (languageMode) {
          this.setState({ language: languageMode.mime || languageMode.mode })
        }
      } else {
        this.setState({ language: props.config.language })
      }
    },
    ms('300ms'),
    { trailing: true }
  )

  render() {
    const config = { ...DEFAULT_SETTINGS, ...this.props.config }
    const options = {
      lineNumbers: config.lineNumbers,
      mode: this.state.language || 'plaintext',
      theme: config.theme,
      scrollBarStyle: null,
      viewportMargin: Infinity,
      lineWrapping: true
    }

    // set content to spinner if loading, else editor
    let content = (
      <div>
        <Spinner />
        <style jsx>
          {`
            div {
              height: 352px;
            }
          `}
        </style>
      </div>
    )

    if (this.state.loading === false) {
      console.log(config.widthAdjustment)
      content = (
        <div className="carbon-container" style={{ fontSize: config.fontSize }}>
          {config.windowControls ? <WindowControls theme={config.windowTheme} /> : null}
          <CodeMirror
            className={`CodeMirror__container window-theme__${config.windowTheme}`}
            onBeforeChange={(editor, meta, code) => this.codeUpdated(code)}
            value={this.props.children}
            options={options}
          />
          <style jsx>{`
            .carbon-container {
              text-align: left;
              position: relative;
              min-width: ${config.widthAdjustment ? '90px' : '75vw'};
              max-width: 1024px; /* The Fallback */
              max-width: 95vw;
              padding: ${config.paddingVertical} ${config.paddingHorizontal};
            }

            .carbon-container :global(.cm-s-dracula .CodeMirror-cursor) {
              border-left: solid 2px #159588;
            }

            .carbon-container :global(.cm-s-solarized) {
              box-shadow: none;
            }

            .carbon-container :global(.cm-s-solarized.cm-s-light) {
              text-shadow: #eee8d5 0 1px;
            }

            .carbon-container :global(.CodeMirror-gutters) {
              background-color: unset;
              border-right: none;
            }

            .carbon-container :global(.CodeMirror__container) {
              min-width: inherit;
              position: relative;
              z-index: 1;
              border-radius: 5px;
            }

            .carbon-container :global(.CodeMirror__container .CodeMirror) {
              height: auto;
              min-width: inherit;
              padding: 18px 18px;
              ${config.lineNumbers ? 'padding-left: 12px;' : ''} border-radius: 5px;
              font-family: ${config.fontFamily}, monospace !important;
              font-size: inherit;
              font-variant-ligatures: contextual;
              font-feature-settings: 'calt' 1;
              user-select: none;
            }

            .carbon-container :global(.CodeMirror-scroll) {
              overflow: hidden !important;
            }

            .carbon-container :global(.window-theme__sharp > .CodeMirror) {
              border-radius: 0px;
            }

            .carbon-container :global(.window-theme__bw > .CodeMirror) {
              border: 2px solid ${COLORS.SECONDARY};
            }

            .carbon-container :global(.window-controls + .CodeMirror__container > .CodeMirror) {
              padding-top: 48px;
            }

            :global(.CodeMirror pre) {
              box-shadow: none !important;
              width: auto !important;
            }
          `}</style>
        </div>
      )
    }

    return (
      <div>
        <div className="carbon-editor-container" ref={ele => (this.exportContainerNode = ele)}>
          {content}
        </div>
        <style jsx>{`
          .carbon-editor-container {
            box-sizing: border-box !important;
            line-height: 1.2;
          }

          .carbon-editor-container {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            overflow: hidden;
          }
          :global(.reveal [data-carbon]) {
            box-shadow: none;
            display: block;
            position: relative;
            width: auto;
            margin: 0;
            text-align: left;
            font-size: inherit;
            font-family: monospace;
            line-height: 1.2em;
            word-wrap: break-word;
          }
        `}</style>
      </div>
    )
  }
}

export default Carbon
