<template>
  <div id="container"></div>
</template>

<script>
    import {init, animate} from "./ShaderTestFunctions"

    export default{
        data(){
            return {

            }
        },
        mounted(){
			init();
        }
    }

</script>