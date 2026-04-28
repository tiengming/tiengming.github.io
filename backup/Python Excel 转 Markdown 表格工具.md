### 技术文档：Python Excel 转 Markdown 表格工具

#### **用途**
本 Python 脚本用于将 Excel 文件的内容转换为 Markdown 格式的表格，便于在 Markdown 文档中呈现数据。它支持读取 Excel 文件的所有数据，包括公式，并将其转换为 Markdown 格式，适用于文档编写、博客发布或数据整理场景。

#### **特点**
- **支持公式保留**：即使 Excel 文件包含公式，也会以 `=` 前缀保留公式内容。
- **自动转换 Markdown 表格**：根据 Excel 数据动态生成符合 Markdown 语法的表格格式。
- **处理空值**：对于 Excel 表格中的空单元格，自动填充为空字符串，以保证 Markdown 语法完整性。
- **用户交互**：通过 `input` 让用户输入 Excel 文件路径，实现灵活选择文件进行转换。
- **输出文件**：转换后的 Markdown 文件会与 Excel 文件同目录，并以 `.md` 作为后缀命名。

#### **使用方法**
1. **安装依赖**
   确保已安装 `openpyxl` 库，如果未安装，请运行（建议虚拟环境）：
   ```bash
   pip install openpyxl
   ```
2. **复制脚本**
代码如下，保存为py文件：
```python
import openpyxl

output_path = 'data'  # 解压 Excel 后的临时文件夹名称

file_path = input("请输入 Excel 文件路径：")
md_path = file_path.split('.')[0] + ".md"  # 输出的 Markdown 文件名

# 使用 openpyxl 读取 Excel 文件
wb = openpyxl.load_workbook(file_path, data_only=False)  # data_only=False 保留公式
ws = wb.active

result = []
# 遍历每一行
for row in ws.iter_rows():
    row_data = []
    # 遍历每个单元格
    for cell in row:
        if cell.value is None:
            row_data.append("")
        elif cell.data_type == 'f':  # 如果是公式
            row_data.append(f"={cell.value}")
        else:
            row_data.append(str(cell.value))
    result.append(row_data)

# 确保至少有一行数据
if not result:
    print("警告：没有找到任何数据！")
    exit()
# 构建 Markdown 表格
# 生成第一行
markdown_table = "|"
markdown_table += "|".join(result[0]) + "|"
markdown_table += "\n"
# 生成分隔行（第二行）
markdown_table += "|"
markdown_table += "|".join(["-" for _ in result[0]]) + "|"
markdown_table += "\n"
# 生成后续的行
for row in result[1:]:
    markdown_table += "|"
    markdown_table += "|".join([str(value) for value in row]) + "|"
    markdown_table += "\n"
# 去除多余的换行符
markdown_table = markdown_table[:-1]

# 生成 Markdown 文件
with open(md_path, 'w', encoding='utf-8') as md_file:
    md_file.write(markdown_table)

print(f"转换完成！Markdown 文件已保存为：{md_path}")
```
3. **运行脚本**   在终端或命令行运行：
   ```bash
   python script.py
   ```
   （将 `script.py` 替换为你的 Python 文件名）

4. **输入 Excel 文件路径**
   按提示输入 Excel 文件路径，例如：
   ```
   请输入 Excel 文件路径：test.xlsx
   ```
   
5. **查看转换结果**
   转换后的 Markdown 表格将被保存为 `原文件名.md`，并在同目录下生成。

#### **示例**
假设 Excel 文件内容如下：

| 姓名  | 年龄 | 工作    |
|------|----|------|
| 张三  | 28  | 工程师  |
| 李四  | 25  | 设计师  |

转换后的 Markdown 文件如下：
```
| 姓名  | 年龄 | 工作    |
|------|----|------|
| 张三  | 28  | 工程师  |
| 李四  | 25  | 设计师  |
```

此脚本适用于 Excel 到 Markdown 转换的场景，提升效率并确保数据格式化清晰。

希望这个文档能帮助你！
