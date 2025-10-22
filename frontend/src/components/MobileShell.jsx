import React from 'react'

const MobileShell = ({ children, title }) => {
  return (
    <div className="mobile-viewport">
      <div className="mobile-device">
        <header className="mobile-header">
          {title ? <h1 className="mobile-title">{title}</h1> : null}
        </header>
        <main className="mobile-content">{children}</main>
        <div className="mobile-bottom-notch" aria-hidden />
      </div>
    </div>
  )
}

export default MobileShell
