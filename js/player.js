export function createPlayer(audioElement, { onTrackEnded, onPlaybackError } = {}) {
  const player = {
    audio: audioElement,
    isPlaying: false,
    currentSong: null,
    setSong(song) {
      this.currentSong = song;
      if (!song || !song.audioUrl) {
        this.audio.removeAttribute('src');
        this.audio.load();
        this.isPlaying = false;
        return false;
      }

      this.audio.src = song.audioUrl;
      this.audio.load();
      return true;
    },
    togglePlayback() {
      if (!this.currentSong || !this.currentSong.audioUrl) {
        return false;
      }

      if (this.audio.paused) {
        this.audio.play().catch((error) => {
          console.warn('Audio playback could not start:', error);
          this.isPlaying = false;
          if (typeof onPlaybackError === 'function') {
            onPlaybackError(error);
          }
        });
        this.isPlaying = true;
        return true;
      }

      this.audio.pause();
      this.isPlaying = false;
      return true;
    },
    stop() {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.isPlaying = false;
    },
    updateProgressBar() {
      if (!this.audio.duration || Number.isNaN(this.audio.duration)) {
        return;
      }
      return (this.audio.currentTime / this.audio.duration) * 100;
    },
  };

  audioElement.addEventListener('ended', () => {
    player.isPlaying = false;
    if (typeof onTrackEnded === 'function') {
      onTrackEnded();
    }
  });

  audioElement.addEventListener('error', (event) => {
    console.warn('Audio error', event);
    player.isPlaying = false;
    if (typeof onPlaybackError === 'function') {
      onPlaybackError(event);
    }
  });

  return player;
}
