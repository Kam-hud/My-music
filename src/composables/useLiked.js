/**
 * 收藏（我喜欢）组合式封装
 * 收藏数据随播放偏好一起持久化在 localStorage（见 usePlayer）。
 */
import { computed } from 'vue'
import { state, isLiked, toggleLike, songKey } from './usePlayer'

export function useLiked() {
  const likedSongs = computed(() => state.likedSongs)
  const count = computed(() => state.likedSongs.length)

  /** 是否已收藏 */
  function liked(song) {
    return isLiked(song)
  }

  /** 批量判断，返回 { [songKey]: true } */
  function likedMap() {
    const map = {}
    state.likedSongs.forEach((s) => {
      map[songKey(s)] = true
    })
    return map
  }

  return { likedSongs, count, liked, likedMap, isLiked, toggleLike }
}
