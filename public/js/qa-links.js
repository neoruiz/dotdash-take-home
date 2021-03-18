/* globals Vue:true VueRouter:true, $:true */
(function() {
    
    new Vue({
        el: '#qa-links',
        components: {},
        data: {
            qaLinks: [],
            checkAll: false
        },
        methods: {
            getData: function(){
                axios.get(`/urls/${this.$refs['collections'].value}`)
                .then(res => {
                    this.qaLinks = res.data.results.map((item) => {
                        return {
                            ...item,
                            checked: false
                        }
                    })
                })
                .catch(err => {
                    console.log(err);
                });
            },
            openUrl: function( url, name ){
                window.open(url,'_blank', '');
            },
            updateList: function(){
                this.getData();
            },
            openAll: function( referral ){
                this.qaLinks.forEach(item => {
                    if (item.checked){
                        this.openUrl(referral + item.url, item.name);
                    }
                });
            },
        },
        watch: {
            checkAll: function (val) {
                this.qaLinks = this.qaLinks.map((item) => {
                    return {
                        ...item,
                        checked: val
                    }
                });
            }
        },
        mounted: function() {
            this.getData();
        }
    });
        
    Vue.config.devtools = true;
    Vue.config.productionTip = false;

})();    