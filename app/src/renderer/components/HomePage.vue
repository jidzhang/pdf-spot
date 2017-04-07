<template>
    <div>
        <el-row>
            <el-col :span="4">
                <el-menu default-active="2" class="el-menu-vertical-demo" @open="handleOpen" @close="handleClose" theme="dark">
                    <el-submenu index="1">
                        <template slot="title">导航一</template>
                        <el-menu-item-group title="分组一">
                            <el-menu-item index="1-1">选项1</el-menu-item>
                            <el-menu-item index="1-2">选项2</el-menu-item>
                        </el-menu-item-group>
                        <el-menu-item-group title="分组2">
                            <el-menu-item index="1-3">选项3</el-menu-item>
                        </el-menu-item-group>
                        <el-submenu index="1-4">
                            <template slot="title">选项4</template>
                            <el-menu-item index="1-4-1">选项1</el-menu-item>
                        </el-submenu>
                    </el-submenu>
                    <el-menu-item index="2">导航二</el-menu-item>
                    <el-menu-item index="3">导航三</el-menu-item>
                </el-menu>
                <div>
                    <label for="load-pdf">加载 PDF 文件</label>
                    <input type="file" name="file" accept="application/pdf" id="load-pdf" placeholder="选择 PDF 文件">
                </div>

            </el-col>
            <el-col :span="16">
                <pdf-viewer></pdf-viewer>
            </el-col>
            <el-col :span="4">
                <el-menu default-active="2" class="el-menu-vertical-demo" @open="handleOpen" @close="handleClose" theme="dark">
                    <el-menu-item index="1" id="prePage">上一页</el-menu-item>
                    <el-menu-item index="2" id="nextPage">下一页</el-menu-item>
                    <el-menu-item index="3" id="drawLine">画线</el-menu-item>
                    <el-menu-item index="4" id="scaleAndPan">缩放</el-menu-item>
                </el-menu>
            </el-col>
        </el-row>
    </div>
</template>

<script>

    import PdfViewer from './PDFViewer/PdfViewer.vue'

    export default {
      components: {
          PdfViewer
      },
      methods: {
        handleOpen (key, keyPath) {
          console.log(key, keyPath)
        },
        handleClose (key, keyPath) {
          console.log(key, keyPath)
        }
      },
      name: 'home-page'
    }

</script>

<style scoped>

</style>
