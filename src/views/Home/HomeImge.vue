<script setup lang="ts">
import { ref } from 'vue'
import { ElNotification } from 'element-plus'
type fileType = File | undefined
interface ResultType {
  blob: Blob | null
  url: string
}
interface ImgeType {
  url: string
  blob: Blob | null
  id: number
}
const contenter = ref(0)
const refImge = ref<ImgeType[]>([])
const inputRef = ref<HTMLInputElement | null>(null)
const formInline = ref({
  count: 2,
  region: 1,
  w: 300,
  h: 200
})
const clearDataFn = () => {
  if (inputRef.value) {
    inputRef.value.value = '' as any
  }
}
const fileChageData = async (file: Event) => {
  refImge.value = []
  const fileData = file.target as HTMLInputElement
  const fileDataList: fileType = fileData.files?.[0]

  for (let i = 0; i < formInline.value.count; i++) {
    const imgUrlBobl: ResultType = await fileToVideo(fileDataList, formInline.value.region * i)
    videoToimgShow(imgUrlBobl, i)
  }
  clearDataFn()
}
//将视频的每一帧展现到页面
const videoToimgShow = (imgUrlBobl: ResultType, index: number) => {
  //显示当前解析到第几张图片
  contenter.value = index + 1
  //将图片展现到页面
  refImge.value.push({
    url: imgUrlBobl.url,
    blob: imgUrlBobl.blob,
    id: index
  })
  if (contenter.value === formInline.value.count) {
    ElNotification({
      title: '标题名称',
      message: '解析完成',
      duration: 4500
    })
  }
}
//将文件转出视频
const fileToVideo = (file: fileType, time: number): Promise<ResultType> => {
  return new Promise((resolve) => {
    const vadio = document.createElement('video') as HTMLVideoElement
    vadio.currentTime = time
    vadio.muted = true
    vadio.autoplay = true
    vadio.src = URL.createObjectURL(file as Blob)
    vadio.oncanplay = async () => {
      const newBlob = await drawImage(vadio)
      var duration = vadio.duration
      console.log(duration)
      resolve(newBlob)
    }
  })
}
//画出图片
const drawImage = (vadio: HTMLVideoElement): Promise<ResultType> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas') as HTMLCanvasElement
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    canvas.width = vadio.videoWidth
    canvas.height = vadio.videoHeight
    ctx.drawImage(vadio, 0, 0, canvas.width, canvas.height)
    canvas.toBlob((blob: Blob | null) => {
      resolve({
        blob,
        url: URL.createObjectURL(blob as Blob)
      })
    })
  })
}
//下载的方法
const dowloaeClick = (item: ImgeType) => {
  const a = document.createElement('a') as HTMLAnchorElement

  a.href = item.url
  a.download = new Date().getTime() + 'png'
  a.click()
  URL.revokeObjectURL(item.url)
}
</script>

<template>
  <div class="home_warp">
    <el-affix :offset="10">
      <div>
        <el-form :inline="true" :model="formInline" class="fle_title">
          <el-form-item style="width: 100px">
            <input type="file" @change="fileChageData" ref="inputRef" accept="video/*" />
          </el-form-item>
          <el-form-item label="图片张数">
            <el-input-number v-model="formInline.count" :min="1" :max="1000" />
          </el-form-item>
          <el-form-item label="每一帧的秒数">
            <el-input-number v-model="formInline.region" :min="0.1" :max="50" />
          </el-form-item>
          <el-form-item label="图片宽" style="width: 120px">
            <el-input v-model="formInline.w"></el-input>
          </el-form-item>
          <el-form-item label="图片高" style="width: 120px">
            <el-input v-model="formInline.h"></el-input>
          </el-form-item>
          <el-form-item>
            <el-tag type="info" size="large" style="margin: 0 10px"
              >当前解析图片{{ contenter }}个</el-tag
            >
          </el-form-item>
        </el-form>
      </div>
    </el-affix>
    <div class="img_box">
      <div v-for="item in refImge" :key="item.id" class="box_btn">
        <el-image
          :style="{ width: formInline.w + 'px', height: formInline.h + 'px', margin: '10px' }"
          :src="item.url"
          :zoom-rate="1.2"
          :preview-src-list="[item.url]"
        />

        <el-button style="display: block" @click="dowloaeClick(item)">下载</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.fle_title {
  display: flex;
  align-items: center;
  background: #fff;
}
.img_box {
  display: flex;
  flex-wrap: wrap;
  .box_btn {
    text-align: center;
    img {
      margin: 10px;
    }
  }
}
</style>
