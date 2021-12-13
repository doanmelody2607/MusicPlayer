const $ = document.querySelector.bind(document)
const $$ =document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = "DOAN_MEO"

const player = $('.player')
const cd = $('.cd')
const playlist = $('.playlist')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const progress = $('.progress')
const playBtn = $('.btn-toggle-play')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')

const app = {
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    currentIndex: 0,

    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},

    "songs": [
        {
            "name": "Chúng Ta Của Hiện Tại",
            "singer": "Sơn Tùng MTP",
            "path": "./music/song1.flac",
            "image": "./image/mtp1.jpg"
        },
        {
            "name": "Em Của Ngày Hôm Qua",
            "singer": "Sơn Tùng MTP",
            "path": "./music/song2.m4a",
            "image": "./image/mtp2.jpg"
        },
        {
            "name": "Chắc Ai Đó Sẽ Về",
            "singer": "Sơn Tùng MTP",
            "path": "./music/song3.m4a",
            "image": "./image/mtp2.jpg"
        },
        {
            "name": "Hãy Trao Cho Anh",
            "singer": "Sơn Tùng MTP",
            "path": "./music/song4.m4a",
            "image": "./image/mtp2.jpg"
        },
        {
            "name": "Lạc Trôi",
            "singer": "Sơn Tùng MTP",
            "path": "./music/song5.m4a",
            "image": "./image/mtp2.jpg"
        },
        {
            "name": "Muộn Rồi Mà Sao Còn",
            "singer": "Sơn Tùng MTP",
            "path": "./music/song6.m4a",
            "image": "./image/mtp3.jpg"
        },
        {
            "name": "Chạy Ngay Đi",
            "singer": "Sơn Tùng MTP",
            "path": "./music/song7.mp3",
            "image": "./image/mtp4.jpg"
        },
        {
            "name": "Anh Sai Rồi",
            "singer": "Sơn Tùng MTP",
            "path": "./music/song8.mp3",
            "image": "./image/mtp5.jpg"
        }
    ],

    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                    <div class="thumb" 
                        style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        })
        playlist.innerHTML = htmls.join('')
    },

    setConfig: function (key, value) {
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },

    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex]
            }
        })
    },

    handleEvents: function () {
        const _this = this
        const cdWidth = cd.offsetWidth

        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)'}
        ], {
            duration: 10000,
            iterations: Infinity,
        })
        cdThumbAnimate.pause()

        // Xử lý khi scroll
        document.onscroll = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }

        // Xử lý khi click Play
        playBtn.onclick = () => {
            if (_this.isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }
        }

        // Xử lý khi song được play
        audio.onplay = () => {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
            _this.scrollToActiveSong()
        }

        // Xử lý khi song bị pause
        audio.onpause = () => {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
            _this.scrollToActiveSong()
        }

        // Xử lý thanh Progress
        audio.ontimeupdate = () => {
            const progressPercent = Math.floor(audio.currentTime / audio.duration * 100) 
            progress.value = progressPercent
        }

        // Xử lý khi tua 
        progress.oninput = (e) => {
            const seek = audio.duration / 100 * e.target.value
            audio.currentTime = seek
        }

        // Xử lý khi bấm Next
        nextBtn.onclick = () => {
            if (_this.isRandom) {
                _this.playRandomSong()
            }  else {
                _this.nextSong()
            }
            audio.play()
            _this.render()
        }

        // Xử lý khi bấm Prev
        prevBtn.onclick = () => {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.prevSong()
            }
            audio.play()
            _this.render()
        }

        // Xử lý khi bật mode Random
        randomBtn.onclick = () => {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }

        // Xử lý khi bật mode Repeat
        repeatBtn.onclick = () => {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }

        // Xử lý khi hết nhạc
        audio.onended = () => {
            if (_this.isRepeat) {
                audio.play()
            }
            else {
                nextBtn.click()
            }
        }

        // Xử lý khi click vào song
        playlist.onclick = (e) => {
            const songNode = e.target.closest('.song:not(.active)')
            if (songNode || e.target.closest('.option')) {
                // Xử lý khi click vào song
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    audio.play()
                    _this.render()
                }

                // Xử lý khi click vào option
                if (e.target.closest('option')) {

                }
            }
        }
    },

    loadConfig: function () {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },

    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
    },

    scrollToActiveSong: function () {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            })
        }, 300)
    },

    nextSong: function () {
        this.currentIndex++
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },

    prevSong: function () {
        this.currentIndex--
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },

    playRandomSong: function () {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex)
        this.currentIndex = newIndex
        this.loadCurrentSong()
    },

    start: function () {
        this.loadConfig()

        this.defineProperties()

        this.loadCurrentSong()

        this.handleEvents()

        this.render()

        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)
    }
}

app.start()