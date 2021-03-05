<template>
<div>
    <div v-if="!item.hidden&&item.children" class="menu-wrapper">
    <router-link v-if="hasOneShowingChild(item.children) && !onlyOneChild.children&&!item.alwaysShow" :to="resolvePath(onlyOneChild.path)">
      <el-menu-item :index="resolvePath(onlyOneChild.path)" :class="{'submenu-title-noDropdown':!isNest}">
        <span v-if="onlyOneChild.meta&&onlyOneChild.meta.title" slot="title">{{onlyOneChild.meta.title}}</span>
      </el-menu-item>
    </router-link>

    <el-submenu v-else :index="item.name||item.path">
      <template slot="title">
        <span v-if="item.meta&&item.meta.title" slot="title">{{item.meta.title}}</span>
      </template>
      <div >
      <template v-for="(child,index) in item.children">
        <div v-if="!child.hidden" :key="index">
          <sidebar-item :is-nest="true" class="nest-menu" v-if="child.children&&child.children.length>0" :item="child" :key="child.path" :base-path="resolvePath(child.path)"></sidebar-item>
          <router-link v-else :to="resolvePath(child.path)" :key="child.name">
            <el-menu-item :index="resolvePath(child.path)">
              <span v-if="child.meta&&child.meta.title" slot="title">{{child.meta.title}}</span>
            </el-menu-item>
          </router-link>
        </div>
   
      </template>
      </div>
    </el-submenu>
    </div>
    <div v-if="!item.hidden&&!item.children">
        <router-link :to="resolvePath(item.path)" :key="item.name">
          <el-menu-item :index="resolvePath(item.path)">
            <span v-if="item.meta&&item.meta.title" slot="title">{{item.meta.title}}</span>
          </el-menu-item>
        </router-link>
    </div>
</div>

</template>

<script>
import path from 'path';

export default {
  name: 'SidebarItem',
  props: {
    // route配置json
    item: {
      type: Object,
      required: true,
    },
    isNest: {
      type: Boolean,
      default: false,
    },
    basePath: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      onlyOneChild: null,
    };
  },
  methods: {
    hasOneShowingChild(children) {
      const showingChildren = children.filter((item) => {
        if (item.hidden) {
          return false;
        }
        // temp set(will be used if only has one showing child )
        this.onlyOneChild = item;
        return true;
      });
      if (showingChildren.length === 1) {
        return true;
      }
      return false;
    },
    resolvePath(routePath){
      // console.log('path',path.resolve(this.basePath,routePath))
        return path.resolve(this.basePath,routePath);
    },
  },
};
</script>
