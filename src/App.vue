<template>
<div id="app">
  <draggable v-model="units" handle=".handler" class="unitsContainer" :class="{dragging}"
             @start="dragging=true" @end="onDraggingEnd" :animation="200"
  >
    <transition-group type="transition" :name="!dragging ? 'flip-list' : null">
      <div v-for="(unit, index) in units" class="unit" :key="unit.local_id">
        <div class="handler">
          <i class="fas fa-ellipsis-v"></i>
        </div>
        <div class="unitBody" @click="onClickOnUnitBody(unit)">
          <TextUnit v-if="unit.type === unitTypes.text" :content="unit.content" @update="unit.content = $event;"
                    @enter="createNewTextUnit(unit.local_id, index)"
                    @delete="deleteTextUnit(unit.local_id, index)"
                    @blur="saveUnits"
                    :ref="'unit_'+unit.local_id"
                    class="textUnit"
          />

          <div v-if="unit.type === unitTypes.unit"
               class="fullUnit"
               :style="{borderColor: unitColors[unit.color] || defaultColor}"
          >
            <TextUnit :content="unit.title" @update="unit.title = $event;"
                      :ref="'unit_'+unit.local_id"
                      @enter="onFullUnitEnterKey(unit.local_id)"
                      @blur="onFullUnitBlur(index)"
            />
            <div class="plusIconContainer" @click="createNewFullUnit(unit.local_id, index)">
              <i class="fas fa-plus-circle"></i>
            </div>
          </div>
        </div>
      </div>
    </transition-group>
  </draggable>
</div>
</template>

<script>
import * as api from 'src/api'
import {UNIT_TYPES, UNIT_COLORS} from 'src/constants'
import TextUnit from 'src/components/TextUnit.vue'
import {placeCaretAtEnd, randomInt} from 'src/utils'

const fullUnitColorNames = Object.keys(UNIT_COLORS)

export default {
  name: 'app',
  components: {
    TextUnit
  },
  data() {
    return {
      units: [],
      unitTypes: UNIT_TYPES,
      unitColors: UNIT_COLORS,
      defaultColor: '#bbb',
      dragging: false,
    }
  },
  methods: {
    getElementByLocalId(local_id) {
      const ref = this.$refs['unit_' + local_id][0]
      if (!ref) return null

      return ref.$el || null
    },
    focusOnTextUnit(local_id, placeCaret) {
      const $el = this.getElementByLocalId(local_id)
      if(!$el) return

      $el.focus()
      if (placeCaret) placeCaretAtEnd($el)
    },
    generateNewLocalId() {
      return Math.floor(Math.random() * 1000000000)
    },
    createNewFullUnit(requesterLocalId, requesterIndex) {
      const local_id = this.generateNewLocalId()

      const newUnit = {
        local_id,
        type: UNIT_TYPES.unit,
        title: '',
        color: fullUnitColorNames[randomInt(0, fullUnitColorNames.length)],
      }
      this.units.splice(requesterIndex + 1, 0, newUnit)
      this.$nextTick(() => {
        this.focusOnTextUnit(local_id)
      })
    },
    createNewTextUnit(requesterLocalId, requesterIndex) {
      const local_id = this.generateNewLocalId()
      const newUnit = {
        local_id,
        type: UNIT_TYPES.text,
        content: '',
      }
      this.units.splice(requesterIndex + 1, 0, newUnit)
      this.$nextTick(() => {
        this.focusOnTextUnit(local_id)
      })
    },
    deleteTextUnit(local_id, index) {
      this.units.splice(index, 1)

      const previousUnit = this.units[index - 1]
      if (previousUnit && previousUnit.type === UNIT_TYPES.text) {
        this.$nextTick(() => {
          this.focusOnTextUnit(previousUnit.local_id, true)
        })
      }

      this.saveUnits()
    },
    onClickOnUnitBody(unit) {
      if (unit.type === UNIT_TYPES.text) this.focusOnTextUnit(unit.local_id)
    },
    onFullUnitEnterKey(local_id) {
      const $el = this.getElementByLocalId(local_id)
      if (!$el) return

      $el.blur()
    },
    onFullUnitBlur(index) {
      const unit = this.units[index]
      if (!unit || !unit.title.length) unit.title = 'New Unit'

      this.saveUnits()
    },
    onDraggingEnd(event) {
      this.dragging = false
      this.saveUnits()
    },
    saveUnits() {
      console.log('saving units')
      api.setUnits(this.units)
    },
  },
  created() {
    this.units = api.getUnits()
    window.app = this
  },
}
</script>

<style lang="scss">
@import 'src/variables.scss';

body {
  font-family: Helvetica, Calibri, sans-serif;
}

p {
  margin: 0;
  padding: 0;
}

.unitsContainer {
  width: 50rem;
  margin: 2rem auto;

  --color-icons: var(--palette-accent);

  .flip-list-move {
    transition: transform 0.5s;
  }

  .no-move {
    transition: transform 0s;
  }

  &.dragging {
    .unit:hover {
      .handler {
        opacity: 0;
      }
    }
  }

  .unit {
    display: flex;

    position: relative;

    .unitBody {
      width: 100%;
    }

    .textUnit {
      padding: 0.5rem 1rem;
    }

    .fullUnit {
      border-left: .25rem solid;
      padding: 1rem .75rem;
      margin: .25rem 0;

      .plusIconContainer {
        position: absolute;
        color: var(--color-icons);

        top: 50%;
        margin-top: -.5rem;

        left: -1rem;

        cursor: pointer;
        opacity: 0;
        transition: opacity .1s ease-in;
      }
    }

    .handler {
      display: flex;
      align-items: center;
      justify-content: center;

      width: 2rem;

      opacity: 0;
      transition: opacity .1s ease-in;

      color: var(--color-icons);

      cursor: pointer;
    }

    &:hover {
      .handler {
        opacity: 1;
      }

      .fullUnit {
        .plusIconContainer {
          opacity: 1;
        }
      }
    }

    &[draggable=true] {
      .handler {
        opacity: 1;
      }
    }
  }
}
</style>
