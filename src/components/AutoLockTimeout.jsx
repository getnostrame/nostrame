import browser from 'webextension-polyfill'
import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'

const TIMEOUT_OPTIONS = [
  { value: 5 * 60 * 1000, label: '5 minutes' },
  { value: 10 * 60 * 1000, label: '10 minutes' },
  { value: 30 * 60 * 1000, label: '30 minutes' },
  { value: 0, label: 'Never' },
]

const AutoLockTimeout = () => {
  const [timeout, setTimeout_] = useState(5 * 60 * 1000)

  useEffect(() => {
    browser.storage.local.get(['autoLockTimeout']).then(({ autoLockTimeout }) => {
      if (autoLockTimeout !== undefined) {
        setTimeout_(autoLockTimeout)
      }
    })
  }, [])

  const handleChange = async (e) => {
    const value = Number(e.target.value)
    setTimeout_(value)
    await browser.storage.local.set({ autoLockTimeout: value })
    await browser.runtime.sendMessage({ type: 'AUTO_LOCK_TIMEOUT_CHANGED' })
    toast.success('Auto-lock timeout updated')
  }

  return (
    <div className="options-card">
      <div className="options-card__header">
        <div className="options-card__icon">
          <i className="icon-hour-glass"></i>
        </div>
        <div className="options-card__title">
          <h3>Auto-Lock Timeout</h3>
          <p>Lock the vault after a period of inactivity</p>
        </div>
      </div>
      <div className="options-card__content">
        <div className="auto-lock-form">
          <div className="auto-lock-form__field">
            <label>Lock after</label>
            <select value={timeout} onChange={handleChange}>
              {TIMEOUT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AutoLockTimeout
