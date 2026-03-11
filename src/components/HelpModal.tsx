import { WORD_LENGTH, MAX_GUESSES } from '../lib/game'

interface HelpModalProps {
  onClose: () => void
}

export default function HelpModal({ onClose }: HelpModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h2 className="modal__title">როგორ ვითამაშოთ</h2>
          <button className="modal__close" onClick={onClose} aria-label="დახურვა">
            &times;
          </button>
        </div>

        <hr className="modal__divider" />

        <div className="help-example">
          <p>გამოიცანით სიტყვა {MAX_GUESSES} ცდაში.</p>
          <p>
            თითოეული ცდის შემდეგ, ფილების ფერი შეიცვლება და გაჩვენებთ,
            რამდენად ახლოს არის თქვენი პასუხი სწორ სიტყვასთან.
          </p>
          <p>სიტყვა შედგება {WORD_LENGTH} ასოსგან.</p>
        </div>

        <hr className="modal__divider" />

        <div className="help-example">
          <p><strong>მაგალითები:</strong></p>

          <div className="help-row">
            <span className="help-tile help-tile--correct">ბ</span>
            <span>ასო <strong>ბ</strong> არის სიტყვაში და სწორ ადგილას.</span>
          </div>

          <div className="help-row">
            <span className="help-tile help-tile--present">ა</span>
            <span>ასო <strong>ა</strong> არის სიტყვაში, მაგრამ არასწორ ადგილას.</span>
          </div>

          <div className="help-row">
            <span className="help-tile help-tile--absent">კ</span>
            <span>ასო <strong>კ</strong> არ არის სიტყვაში.</span>
          </div>
        </div>

        <hr className="modal__divider" />

        <div className="help-example">
          <p>ყოველ დღე ახალი სიტყვა! (საქართველოს დროით)</p>
        </div>
      </div>
    </div>
  )
}
