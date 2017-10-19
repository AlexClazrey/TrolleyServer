(function () {
  var makeBoolean = function (args, name, tag, fallback, item) {
    if (args === undefined) {
      return !!fallback;
    } else if (typeof args === 'boolean') {
      return args;
    } else if (args instanceof Function) {
      return args(item);
    } else {
      console.warn('cannot read ' + name + ' of [' + tag + '], will be ' + (fallback ? 'true' : 'false') + ' .');
      return fallback;
    }
  };
  
  var randStr = function (context) {
    var result = Math.random().toString(36).substring(2);
    while (context && context[result]) {
      result = Math.random().toString(36).substring(2);
    }
    if (context) {
      context[result] = true;
    }
    return result;
  };
  
  Vue.component('vue-button', {
    props: ['name', 'callback', 'appear', 'disabled', 'buttonClass', 'type'],
    template:
      '<button v-if="_appear" :class="_buttonClass" :disabled="_disabled" :type="type || \'button\'" @click="callback">{{ name }}</button>',
    computed: {
      _appear: function () {
        return makeBoolean(this.appear, 'appear condition', this.name, false);
      },
      _disabled: function () {
        return makeBoolean(this.disabled, 'disabled condition', this.name, false);
      },
      _buttonClass: function () {
        return 'btn ' + this.buttonClass;
      }
    },
    methods: {}
  });
  
  Vue.component('vue-button-appear-group', {
    props: ['format'],
    template:
    '<span class="btn-group" role="group">' +
    '<component is="vue-button"  v-for="(buttonItem, index) in format" ' +
    ':key="format[index].name" ' +
    ':appear="_appearArray[index]" ' +
    ':disabled="format[index].disabled" ' +
    ':name="format[index].name" ' +
    ':callback="format[index].callback" ' +
    ':buttonClass="format[index].buttonClass" ' +
    '/>' +
    '<span v-if="_noButton">暂无操作</span>' +
    '</span>',
    computed: {
      _appearArray: function () {
        var result = [];
        this.format.forEach(function (buttonItem) {
          result.push(makeBoolean(buttonItem.appear, 'appear condition', buttonItem.name, true, undefined));
        });
        // console.log('appear result', result);
        return result;
      },
      _noButton: function () {
        return this._appearArray.filter(function (item) {
          return item;
        }).length === 0;
      }
    }
  });
  
  Vue.component('vue-content-span', {
    props: ['component', 'settings', 'data', 'index'],
    template:
      '<span v-html="_content" class="_spanClass"/>'
    ,
    computed: {
      _component: function () {
        if (this.component === undefined) {
          return 'text';
        } else {
          return this.component;
        }
      },
      _spanClass: function () {
        return this.settings && this.settings.spanClass || '';
      },
      _contentClass: function () {
        return this.settings && this.settings.contentClass || '';
      },
      _content: function () {
        var type = this._component;
        var contentClass = this._contentClass;
        var settings = this.settings;
        var data = this.data;
        var date;
        if(data === undefined || data === null) {
          return '<p></p>';
        }
        if (type === 'text') {
          return '<p class="' + contentClass + '">' + data.toString() + '</p>';
        } else if (type === 'number') {
          return '<p class="' + contentClass + '">' + data.toString() + '</p>';
        } else if (type === 'datetime' || type === 'time' || type === 'milliTime') {
          // prepare a date
          if(!(data instanceof Date)) {
            if (typeof data === 'string') {
              data = parseInt(data);
            }
            date = new Date(data);
          } else {
            date = data;
          }
          // format to string
          if(type === 'datetime')
            str = $.format.date(date, 'yyyy-MM-dd HH:mm');
          else if(type === 'time')
            str = $.format.date(date, 'HH:mm:ss');
          else if(type === 'milliTime')
            str = $.format.date(date, 'HH:mm:ss.SSS');
          return '<p class="' + contentClass + '">' + str + '</p>';
        } else if (type === 'id') {
          return '<p class="' + contentClass + '">' + (this.index + 1) + '</p>';
        } else if (type === 'raw') {
          return data;
        } else if (type === 'img' || type === 'image') {
          return '<img ' +
            'class="' + contentClass + '" ' +
            'width="' + (settings && settings.width || '') + '" ' +
            'height="' + (settings && settings.height || '') + '" ' +
            'src="' + data + '" ' +
            '/>'
        } else {
          return '不支持这种数据格式';
        }
      }
    }
  });
  
  Vue.component('vue-table', {
    props: ['format', 'button', 'content', 'loading', 'hideButton', 'hideTableOff'],
    template:
    '<div>' +
    '<p v-if="!hideTableOff && loading" style="font-size: 18px;">加载中...</p>' +
    '<p v-if="!hideTableOff && !loading && content.length === 0" style="font-size: 18px;">暂无结果</p>' +
    '<table v-if="hideTableOff || !loading && content.length > 0" class="table table-hover table-responsive">' +
    '<thead>' +
    '<tr>' +
    '<th v-for="item in format">{{ item.name }}</th>' +
    '<th v-if="!hideButton">操作</th>' +
    '</tr>' +
    '</thead>' +
    '<tbody>' +
    '<tr v-for="(item, index) in _content">' +
    '<td v-for="formatItem in _format" >' +
    '<component is="vue-content-span" ' +
    ':key="formatItem.name" ' +
    ':component="formatItem.component" ' +
    ':data="item[formatItem.key]" ' +
    ':settings="formatItem.settings" ' +
    ':index="index" ' +
    '></component>' +
    '</td>' +
    '<td v-if="!hideButton">' +
    '<component is="vue-button-appear-group" ' +
    ':format="formatTable(button, content[index])" ' +
    ':dataItem="item" ' +
    '></component>' +
    '</td>' +
    '</tr>' +
    '</tbody>' +
    '<tfoot></tfoot>' +
    '</table>' +
    '</div>',
    computed: {
      _content: function () {
        var content = this.content;
        var result = [{}];
        if (this.loading) {
          console.log('loading triggered');
          this.format.forEach(function (item) {
            result[0][item.key] = "加载中...";
          });
          return result;
        }
        if (content === undefined || content === null || content.length === 0) {
          console.log('empty triggered');
          this.format.forEach(function (item) {
            result[0][item.key] = "暂无";
          });
          return result;
        } else {
          return content;
        }
      },
      _format: function() {
        var content = this.content;
        if (content === undefined || content === null || content.length === 0) {
          // console.log('change to format');
          return this.format.map(function(item) {
            var result = Object.assign({}, item);
            result.component = 'text';
            return result;
          });
        } else {
          // console.log('no change to format');
          return this.format;
        }
      }
    },
    methods: {
      formatTable: function (buttonFormat, item) {
        if (buttonFormat === undefined ||　item === undefined) {
          return [
            {
              name: '暂无操作',
              appear: false
            }
          ]
        }
        return buttonFormat.map(function (buttonItem) {
          var result = Object.assign({}, buttonItem);
          result.appear = function () {
            return makeBoolean(buttonItem.appear, 'appear condition', buttonFormat.name, true, item);
          };
          result.disabled = function () {
            return makeBoolean(buttonItem.disabled, 'disabled condition', buttonFormat.name, false, item);
          };
          result.callback = function () {
            buttonItem.callback && buttonItem.callback(item);
          };
          return result;
        });
      }
    }
  });
  
  Vue.component('vue-span-child', {
    render: function (createElement) {
      return createElement('span', this.children || this.$slots.default)
    },
    props: ['children']
  });
  
  Vue.component('vue-modal', {
    props: ['name', 'triggered', 'randId', 'onSubmit', 'width'],
    template:
    '<div :id="_id" tabindex="-1" role="dialog" class="modal fade">' +
    '  <div role="document" class="modal-dialog">' +
    '    <div class="modal-content" :style="_width">' +
    '      <div class="modal-header">' +
    '        <div class="container-fluid">' +
    '          <div class="row">' +
    '            <div class="col col-sm-8">' +
    '              <h5 class="modal-title">{{ name }}</h5>' +
    '            </div>' +
    '            <div class="col col-sm-4">' +
    '              <button type="button" data-dismiss="modal" aria-label="close" class="close"><span>×</span></button>' +
    '            </div>' +
    '          </div>' +
    '        </div>' +
    '      </div>' +
    '      <div class="modal-body">' +
    '        <div class="container-fluid">' +
    '          <component is="vue-span-child" :children="$slots.default"></component>' +
    '        </div>' +
    '      </div>' +
    '      <div class="modal-footer">' +
    '        <button type="button" data-dismiss="modal" class="btn btn-primary" @click="_onSubmit">确定</button>' +
    '        <button type="button" data-dismiss="modal" class="btn btn-secondary">取消</button>' +
    '      </div>' +
    '    </div>' +
    '  </div>' +
    '</div>',
    computed: {
      _width: function () {
        return this.width ? ('width: ' + this.width + ';') : '';
      },
      _id: function () {
        return 'vue-modal' + (this.randId && ('-' + this.randId) || '');
      }
    },
    watch: {
      triggered: function (val) {
        $('#' + this._id).modal(val ? 'show' : 'hide');
      }
    },
    methods: {
      _onSubmit: function () {
        this.onSubmit && this.onSubmit();
      }
    },
    mounted: function () {
      var element = this;
      $('#' + this._id).on('hide.bs.modal', function (event) {
        console.log('modal close');
        element.$emit('modal-close')
      });
    }
  });
  
  var placeholderValue = '_$placeholder_$';
  Vue.component('vue-select', {
    props: ['label', 'placeholder', 'placeholderCanSelect', 'options', 'value', 'onChange', 'randId'],
    template:
    '<div class="form-group row">' +
    '<label class="col-sm-2 col-form-label" :for="\'select-\' + label + \'-\' + _randId">{{ label }}</label>' +
    '<div class="col-sm-10">' +
    '<select :id="\'select-\' + label + \'-\' + _randId" v-model="selectValue" class="form-control" @change="valueChange">' +
    '<option value="_$placeholder_$" selected :disabled="_placeholderDisabled">{{ placeholder }}</option>' +
    '<option v-for="item in _options" :value="item.value">{{ item.name }}</option>' +
    '</select>' +
    '</div>' +
    '</div>',
    data: function () {
      return {
        selectValue: this.value || placeholderValue,
        _placeholderValue: placeholderValue
      };
    },
    computed: {
      _placeholderDisabled: function () {
        return !this.placeholderCanSelect;
      },
      _randId: function () {
        if (this.randId === undefined) {
          return randStr();
        }
        return this.randId;
      },
      _options: function () {
        if (this.options === undefined) {
          return [];
        }
        if (!this.options instanceof Array) {
          console.warn('cannot read format of options');
          return [];
        }
        return this.options.map(function (item) {
          if (typeof item === 'string') {
            return {
              name: item,
              value: item
            }
          } else if (item instanceof Object) {
            return item;
          } else {
            console.warn('cannot read option item format of' + this.label);
            return item;
          }
        });
      }
    },
    watch: {
      value: function(val) {
        this.selectValue =  val || placeholderValue;
        this.valueChange();
      }
    },
    methods: {
      valueChange: function () {
        console.log('_vue', this.selectValue, placeholderValue);
        if (this.selectValue === placeholderValue) {
          this.onChange && this.onChange('');
        } else {
          this.onChange && this.onChange(this.selectValue);
        }
      }
    }
  });
  
  Vue.component('vue-chapter-title', {
    props: ['name'],
    template: '<div class="row mb-2"><h3>{{ name }}</h3></div>'
  });
  
  Vue.component('vue-line-p', {
    props: ['title', 'text', 'color', 'size', 'loading', 'noMb'],
    template:
    '<div :class="\'row\' + (noMb ? \'\' : \' mb-2\')">' +
    '<div class="col-md-3 col-lg-2">' +
    '<p :style="_titleStyle"><strong>{{ title }}</strong></p>' +
    '</div>' +
    '<div class="col-md-9 col-lg-10">' +
    '<p :style="_textStyle">{{ loading ? "加载中..." : text}}</p>' +
    '</div>' +
    '</div>',
    computed: {
      _textStyle: function() {
        var result = '';
        if(this.color) {
          result += 'color: ' + this.color + ';';
        }
        if(this.size) {
          result += 'font-size: ' + this.size + ';';
        }
        return result;
      },
      _titleStyle: function() {
        var result = '';
        if(this.size) {
          result += 'font-size: ' + this.size + ';';
        }
        return result;
      }
    }
  });
  
  Vue.component('vue-selector', {
    props: ['format', 'button', 'content', 'loading', 'hideButton', 'hideSelector'],
    template:
    '<div>' +
    '<p v-if="loading" style="font-size: 18px;">加载中...</p>' +
    '<p v-if="!loading && content.length === 0" style="font-size: 18px;">无</p>' +
    '<table v-if="!loading && content.length > 0" class="table table-hover table-responsive">' +
    '<thead>' +
    '<tr>' +
    '<th v-for="item in format">{{ item.name }}</th>' +
    '<th v-if="!hideButton">操作</th>' +
    '<th v-if="!hideSelector">' +
    '<button v-if="!_allSelected" class="btn btn-sm btn-secondary" @click="selectAll">全选</button>' +
    '<button v-if="_allSelected" class="btn btn-sm btn-secondary" @click="deselectAll">取消全选</button>' +
    '</th>' +
    '</tr>' +
    '</thead>' +
    '<tbody>' +
    '<tr v-for="(item, index) in _content">' +
    '<td v-for="formatItem in _format" >' +
    '<component is="vue-content-span" ' +
    ':key="formatItem.name" ' +
    ':component="formatItem.component" ' +
    ':data="item[formatItem.key]" ' +
    ':settings="formatItem.settings" ' +
    ':index="index" ' +
    '></component>' +
    '</td>' +
    '<td v-if="!hideButton">' +
    '<component is="vue-button-appear-group" ' +
    ':format="formatTable(button, content[index])" ' +
    ':dataItem="item" ' +
    '></component>' +
    '</td>' +
    '<td v-if="!hideSelector">' +
    '<button v-if="!selectArray[index]" class="btn btn-sm btn-primary" @click="selectItem(index)">选择此项</button>' +
    '<button v-if="selectArray[index]" class="btn btn-sm btn-danger" @click="deselectItem(index)">取消选择</button>' +
    '</td>' +
    '</tr>' +
    '</tbody>' +
    '<tfoot></tfoot>' +
    '</table>' +
    '</div>',
    data: function() {
      return {
        selectArray: new Array(this.content.length),
      };
    },
    computed: {
      _content: function () {
        var content = this.content;
        var result = [{}];
        if (this.loading) {
          console.log('loading triggered');
          this.format.forEach(function (item) {
            result[0][item.key] = "加载中...";
          });
          return result;
        }
        if (content === undefined || content === null || content.length === 0) {
          console.log('empty triggered');
          this.format.forEach(function (item) {
            result[0][item.key] = "暂无";
          });
          return result;
        } else {
          return content;
        }
      },
      _format: function() {
        var content = this.content;
        if (content === undefined || content === null || content.length === 0) {
          // console.log('change to format');
          return this.format.map(function(item) {
            var result = Object.assign({}, item);
            result.component = 'text';
            return result;
          });
        } else {
          // console.log('no change to format');
          return this.format;
        }
      },
      _allSelected: function() {
        for(var i = 0; i < this.content.length; i++) {
          if(!this.selectArray[i]) {
            return false;
          }
        }
        return true;
      }
    },
    created: function() {
      this.$parent.$on('select-clear', this.deselectAll);
      this.$parent.$on('select-none', this.deselectAll);
      this.$parent.$on('select-all', this.selectAll);
      this.$parent.$on('select-item', this.selectItem);
      this.$parent.$on('deselect-item', this.deselectItem);
    },
    methods: {
      formatTable: function (buttonFormat, item) {
        if (item === undefined) {
          return [
            {
              name: '暂无',
              appear: false
            }
          ]
        }
        return buttonFormat.map(function (buttonItem) {
          var result = Object.assign({}, buttonItem);
          result.appear = function () {
            return makeBoolean(buttonItem.appear, 'appear condition', buttonFormat.name, true, item);
          };
          result.disabled = function () {
            return makeBoolean(buttonItem.disabled, 'disabled condition', buttonFormat.name, false, item);
          };
          result.callback = function () {
            buttonItem.callback && buttonItem.callback(item);
          };
          return result;
        });
      },
      selectItem: function(index) {
        Vue.set(this.selectArray, index, true);
        this.content[index]._selected = true;
        this.$emit('select-change');
      },
      deselectItem: function(index) {
        Vue.set(this.selectArray, index, false);
        this.content[index]._selected = false;
        this.$emit('select-change');
      },
      selectAll: function() {
        for(var i = 0; i < this.content.length; i++) {
          Vue.set(this.selectArray, i, true);
          this.content[i]._selected = true;
        }
        this.$emit('select-change');
      },
      deselectAll: function() {
        for(var i = 0; i < this.content.length; i++) {
          Vue.set(this.selectArray, i, false);
          this.content[i]._selected = false;
        }
        this.$emit('select-change');
      }
    }
  });

  Vue.component('vue-line-input', {
    props: ['name', 'onChange', 'value', 'leftCol', 'rightCol', 'randId', 'color', 'type'],
    template:
    '<div class="form-group row">' +
    '<label ' +
    'v-bind:class="_leftCol + \' col-form-label\'" ' +
    'v-bind:id="_inputId" ' +
    '>{{ name }}</label>' +
    '<div v-bind:class="_rightCol">' +
    '<input ' +
    'v-if="!type || type === \'text\'" ' +
    'class="form-control" ' +
    'v-bind:style="_inputColor" ' +
    'v-bind:id="_inputId" ' +
    'v-model="inputValue" @change="valueChange"' +
    '/>' +
    '<input ' +
    'v-if="type === \'number\'" ' +
    'type="number" ' +
    'class="form-control" ' +
    'v-bind:style="_inputColor" ' +
    'v-bind:id="_inputId" ' +
    'v-model="inputValue" @change="valueChange"' +
    '/>' +
    '<input ' +
    'v-if="type === \'email\'" ' +
    'type="email" ' +
    'class="form-control" ' +
    'v-bind:style="_inputColor" ' +
    'v-bind:id="_inputId" ' +
    'v-model="inputValue" @change="valueChange"' +
    '/>' +
    '<input ' +
    'v-if="type === \'password\'" ' +
    'type="password" ' +
    'class="form-control" ' +
    'v-bind:style="_inputColor" ' +
    'v-bind:id="_inputId" ' +
    'v-model="inputValue" @change="valueChange"' +
    '/>' +
    '</div>' +
    '</div>',
    data: function() {
      return {
        inputValue: this.value || ''
      };
    },
    computed: {
      _inputId: function() {
        return 'input-' + (this.randId || randStr());
      },
      _leftCol: function() {
        return this.leftCol ? 'col-sm' + this.leftCol : 'col-sm-2';
      },
      _rightCol: function() {
        return this.rightCol ? 'col-sm' + this.rightCol : 'col-sm-10';
      },
      _inputColor: function() {
        return 'color: ' + this.color + ';';
      }
    },
    watch: {
      value: function(val) {
        this.inputValue = val || '';
        this.valueChange();
      }
    },
    methods: {
      valueChange: function() {
        this.onChange && this.onChange(this.inputValue);
      }
    }
  });


}());