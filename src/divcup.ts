const selectDisableStyle = `-webkit-user-select:none; -moz-user-select: none; -ms-user-select: none; user-select: none;`
...
directives: {
    areaSelect: { // 在需要自定义选择的元素上添加 v-areaSelect
        inserted: (el:any, binding:any, vnode:any) => {
            let randIds = new Map()
            let mouseDownFlag = false
            let mouseUpFlag = false
            let cells:any = []
            el.addEventListener('mousedown', function (event) {
                mouseDownFlag = true
                mouseUpFlag = false
                cells = []
                el.querySelectorAll('tr').forEach(tr => {
                    let row = tr.querySelectorAll('td div.cell')
                    row.length > 0 && cells.push(row)
                })
                cells.forEach((tdRow:any, idy?:any) => {
                    tdRow.forEach((tdCol:any, idx:any) => {
                        const style = tdCol.getAttribute('style')
                        if (style.indexOf(selectDisableStyle) < 0) {
                            tdCol.setAttribute('style', style + selectDisableStyle)
                        }
                        // 若表格有 rowIndex ,cellIndex 则可不设 id
                        tdCol.setAttribute('id', `${idy + 1}_${idx + 1}`)
                    })
                })
                // 选中点击的 cell
                removeStyle(event)
            })

            function mouseMove(evt) {
                if (mouseUpFlag || !mouseDownFlag) {
                    return
                }
                // 缓存经过的 cell id
                randIds.set(evt.target.id, evt.target.id)
                // 选中
                removeStyle(evt)
            }

            el.addEventListener('mousemove', mouseMove)
            el.addEventListener('mouseup', function (evt) {
                mouseUpFlag = true
                mouseDownFlag = false
                // 框选逻辑
                let posList = Array.from(randIds).filter(v => v[0]).map(v => v[0]).map(v => v.split('_'))
                let posYList = posList.map(v => v[0])
                let posXList = posList.map(v => v[1])
                let minX = Math.min(...posXList), minY = Math.min(...posYList)
                let maxX = Math.max(...posXList), maxY = Math.max(...posYList)
                cells.forEach(cellRow => {
                    cellRow.forEach(cell => {
                        let [idy, idx] = cell.id.split('_').map(v => Number(v))
                        if (idx >= minX && idx <= maxX && idy >= minY && idy <= maxY) {
                            removeStyle(cell)
                        }
                    })
                })
                // 重置
                randIds = new Map()
                cells = []
            })
        }
    }
}

// 清除禁止选中的样式，同时选中
function removeStyle(evt:any) {
    let target = evt.target || evt
    let style = target.getAttribute('style') || selectDisableStyle
    let reg = new RegExp(selectDisableStyle, 'g')
    target.setAttribute('style', style.replace(reg, ''))
}
