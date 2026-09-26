type RecordingControlProps = { isRecording: boolean; onToggle: () => void }

export function RecordingControl({ isRecording, onToggle }: RecordingControlProps) {
  return <button type="button" onClick={onToggle}>{isRecording ? 'Stop recording' : 'Start recording'}</button>
}
