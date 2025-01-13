import { createApp } from 'vue'
import '@/style.css'
import App from './App.vue'
import router from './router'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faStar, faHeart, faGem, faPodcast, faCompass, faBolt, faAngleUp, faAngleDown } from '@fortawesome/free-solid-svg-icons';
import { faClock, faDownload, faMusic, faCloud, faEdit, faBars, faPlayCircle, faHdd, faTimes } from '@fortawesome/free-solid-svg-icons';

library.add(faStar, faHeart, faGem, faPodcast, faCompass, faBolt, faAngleDown, faAngleUp);
library.add(faClock, faDownload, faMusic, faCloud, faEdit, faBars, faPlayCircle, faHdd, faTimes)

createApp(App)
    .use(router)
    .component('font-awesome-icon', FontAwesomeIcon)
    .mount('#app')
