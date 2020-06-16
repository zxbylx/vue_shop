<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddRoleDialog">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 主体表格区域 -->
      <el-table :data="rolelist" border stripe>
        <el-table-column type="expand">
          <template v-slot="scope">
            <el-row
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
              :class="['bdbottom', i1=== 0 ? 'bdtop' : '', 'vcenter']"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeItemById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <el-row
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                  :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeItemById(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="(item3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeItemById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>{{scope.row}}</pre> -->
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作">
          <template v-slot="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editRole(scope.row.id)"
            >编辑</el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeRoleById(scope.row.id)"
            >删除</el-button>
            <!-- 分配权限按钮 -->
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="setRoleDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRoleDialogVisiable"
      width="50%"
      @close="addRoleDialogClosed"
    >
      <el-form
        ref="addRoleFormRef"
        :model="addRoleForm"
        label-width="80px"
        :rules="addRoleFormRules"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisiable = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色对话框 -->
    <el-dialog
      title="编辑角色"
      :visible.sync="editRoleDialogVisiable"
      width="50%"
      @close="eidtRoleDialogClosed"
    >
      <el-form
        ref="editRoleFormRef"
        :model="editRoleForm"
        label-width="80px"
        :rules="addRoleFormRules"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisiable = false">取 消</el-button>
        <el-button type="primary" @click="editRoleInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色权限对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisable"
      width="50%"
      @close="setRightDialogClosed"
    >
      <el-tree
        :data="rightslist"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defaultKey"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisable = false">取 消</el-button>
        <el-button type="primary" @click="allotRight">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rolelist: [],
      setRoleDialogVisable: false,
      rightslist: [],
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      defaultKey: [],
      roleId: '',
      //   添加角色对话框展示与隐藏
      addRoleDialogVisiable: false,
      //   添加角色的表单数据
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      //   添加角色表单验证规则
      addRoleFormRules: {
        roleName: [
          { required: true, message: '请输入角色名', trigger: 'blur' },
          {
            min: 2,
            max: 10,
            message: '角色名长度需在2到10个字符之间',
            trigger: 'blur'
          }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          {
            min: 2,
            max: 10,
            message: '角色描述长度需在2到10个字符之间',
            trigger: 'blur'
          }
        ]
      },
      editRoleDialogVisiable: false,
      editRoleForm: {}
    }
  },
  created() {
    this.getRoleList()
  },
  methods: {
    async getRoleList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.rolelist = res.data
      console.log(res)
    },
    // 删除角色权限
    async removeItemById(role, rightId) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除')
      }
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败!')
      }
      //   因为返回值就是删除后的角色权限列表，所以不需要重新调用获取角色权限列表的函数，省的刷新页面
      role.children = res.data
    },
    // 展示分配权限对话框
    async setRoleDialog(role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      }
      this.rightslist = res.data
      console.log(this.rightslist)

      this.getLeafNode(role, this.defaultKey)
      this.setRoleDialogVisable = true
    },
    // 递归获取角色下所有三级权限节点
    getLeafNode(node, arr) {
      // 如果当前node节点不包含children属性，则为三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafNode(item, arr))
    },
    // 监听分配权限对话框关闭事件，清空里面勾选权限
    setRightDialogClosed() {
      this.defaultKey = []
    },
    async allotRight() {
      // 通过elementui自带的两个方法获取全选和半选中的权限id
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      )

      if (res.meta.status !== 200) {
        return this.$message.error('角色授权失败')
      }
      this.getRoleList()
      this.setRoleDialogVisable = false
      this.$message.success('角色授权成功')
    },
    showAddRoleDialog() {
      this.addRoleDialogVisiable = true
    },
    addRoleDialogClosed() {
      this.$refs.addRoleFormRef.resetFields()
    },
    addRole() {
      //   在调用接口前先对表单进行预校验，返回布尔值
      this.$refs.addRoleFormRef.validate(async valid => {
        // console.log(valid)
        if (!valid) return
        // 校验成功则继续发起网络请求
        const { data: res } = await this.$http.post('roles', this.addRoleForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加角色失败')
        }
        this.$message.success('添加角色成功')
        // 关闭对话框
        this.addRoleDialogVisiable = false
        // 重新获取角色列表
        this.getRoleList()
      })
    },
    async editRole(id) {
      //   console.log(id)
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询角色信息失败')
      }
      this.editRoleForm = res.data
      this.editRoleDialogVisiable = true
    },
    // 监听修改角色对话框关闭事件，重置对话框
    eidtRoleDialogClosed() {
      this.$refs.editRoleFormRef.resetFields()
    },
    editRoleInfo() {
      this.$refs.editRoleFormRef.validate(async valid => {
        if (!valid) return
        // 预校验通过后更新角色信息
        const { data: res } = await this.$http.put(
          'roles/' + this.editRoleForm.roleId,
          {
            roleName: this.editRoleForm.roleName,
            roleDesc: this.editRoleForm.roleDesc
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('更新角色信息失败')
        }
        // 关闭弹窗
        this.editRoleDialogVisiable = false
        // 刷新数据
        this.getRoleList()
        this.$message.success('更新角色信息成功')
      })
    },
    async removeRoleById(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该角色, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除操作')
      }
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除角色失败')
      }
      //   刷新数据
      this.getRoleList()
      this.$message.success('已成功删除')
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>
