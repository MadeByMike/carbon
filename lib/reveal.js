import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import Carbon from '../components/CarbonStandalone'
import { THEMES, DEFAULT_LANGUAGE, DEFAULT_THEME } from './constants'
import { getState, saveState } from './util'
const removeQueryString = str => {
  const qI = str.indexOf('?')
  return qI >= 0 ? str.substr(0, qI) : str
}

const options = window.Reveal ? Reveal.getConfig().carbon : {}

class Editor extends Component {
  constructor(props) {
    super(props)
    this.state = {
      backgroundMode: 'color',
      theme: DEFAULT_THEME.id,
      language: DEFAULT_LANGUAGE,
      dropShadow: true,
      dropShadowOffsetY: '20px',
      dropShadowBlurRadius: '68px',
      windowControls: false,
      widthAdjustment: false,
      lineNumbers: false,
      paddingVertical: '48px',
      paddingHorizontal: '32px',
      fontSize: '38px',
      uploading: false,
      ...options
    }

    this.state.code = props.code
    this.state.language = props.language ? props.language : this.state.language
    this.state.fontSize = props.fontSize ? props.fontSize : this.state.fontSize

    this.updateCode.bind(this)
    this.updateAspectRatio = this.updateAspectRatio.bind(this)
  }

  componentDidMount() {
    const state = getState(localStorage)
  }

  componentDidUpdate() {
    const s = { ...this.state }
    delete s.code
    delete s.backgroundImage
    delete s.backgroundImageSelection
    saveState(localStorage, s)
  }

  updateCode(code) {
    if (this.props.target) {
      const target = document.querySelector(this.props.target)
      target.innerHTML = code
    }
    this.setState({ code })
  }

  updateAspectRatio(aspectRatio) {
    this.setState({ aspectRatio })
  }

  render() {
    return (
      <Carbon
        config={this.state}
        updateCode={code => this.updateCode(code)}
        onAspectRatioChange={this.updateAspectRatio}
      >
        {this.state.code}
      </Carbon>
    )
  }
}

// Crude AF
function loadCSS(href) {
  var lnk = document.createElement('link')
  lnk.rel = 'stylesheet'
  lnk.href = href
  document.getElementsByTagName('head')[0].appendChild(lnk)
}
loadCSS('http://cdnjs.cloudflare.com/ajax/libs/codemirror/5.26.0/codemirror.min.css')
loadCSS('http://cdnjs.cloudflare.com/ajax/libs/codemirror/5.30.0/theme/solarized.min.css')
THEMES.filter(t => t.hasStylesheet !== false).map((theme, i) => {
  return loadCSS(
    theme.link ||
      `http://cdnjs.cloudflare.com/ajax/libs/codemirror/5.30.0/theme/${theme.id}.min.css`
  )
})

// Nicked from highlight plugin ;) (modified)

function betterTrim(content) {
  // Helper functions
  function trimLeft(val) {
    // Adapted from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/Trim#Polyfill
    return val.replace(/^[\s\uFEFF\xA0]+/g, '')
  }
  function trimLineBreaks(input) {
    var lines = input.split('\n')

    // Trim line-breaks from the beginning
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].trim() === '') {
        lines.splice(i--, 1)
      } else break
    }

    // Trim line-breaks from the end
    for (var i = lines.length - 1; i >= 0; i--) {
      if (lines[i].trim() === '') {
        lines.splice(i, 1)
      } else break
    }

    return lines.join('\n')
  }

  // Main function for betterTrim()
  return (function(content) {
    var lines = content.split('\n')
    // Calculate the minimum amount to remove on each line start of the snippet (can be 0)
    var pad = lines.reduce(function(acc, line) {
      if (
        line.length > 0 &&
        trimLeft(line).length > 0 &&
        acc > line.length - trimLeft(line).length
      ) {
        return line.length - trimLeft(line).length
      }
      return acc
    }, Number.POSITIVE_INFINITY)
    // Slice each line with this amount
    return lines
      .map(function(line, index) {
        return line.slice(pad)
      })
      .join('\n')
  })(content)
}

var sections = document.querySelectorAll('[data-carbon]')
sections.forEach(section => {
  var code = section.innerText
  var data = section.dataset
  if (data.trim) {
    code = betterTrim(code)
  }
  ReactDOM.render(
    <Editor code={code} fontSize={data.fontSize} language={data.language} target={data.target} />,
    section
  )
})
