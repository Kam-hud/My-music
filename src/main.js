import { createApp } from 'vue'
import '@/style.css'
import App from './App.vue'
import router from './router'
import { VueJsonp } from 'vue-jsonp';

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
    faStar, faHeart, faGem, faClock, faDownload, faMusic,
    faAngleUp, faAngleDown, faTimes, faStepBackward, faPause,
    faStepForward, faPlay, faVolumeUp, faSync, faRepeat, faRandom,
    faArrowLeft, faArrowRight, faPalette, faList, faHistory, faTrash,
    faSearch, faUser, faEye, faEyeSlash, faCheck, faImage, faUndo, faRobot,
    faSpinner, faPaperPlane, faLightbulb
} from '@fortawesome/free-solid-svg-icons';

library.add(
    faStar, faHeart, faGem, faClock, faDownload, faMusic,
    faAngleDown, faAngleUp, faTimes, faStepBackward, faPause,
    faStepForward, faPlay, faVolumeUp, faSync, faRepeat, faRandom,
    faArrowLeft, faArrowRight, faPalette, faList, faHistory, faTrash,
    faSearch, faUser, faEye, faEyeSlash, faCheck, faImage, faUndo, faRobot,
    faSpinner, faPaperPlane, faLightbulb
)

createApp(App)
    .use(router, VueJsonp)
    .component('font-awesome-icon', FontAwesomeIcon)
    .mount('#app')
