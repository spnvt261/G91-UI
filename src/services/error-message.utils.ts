import type { ApiValidationErrorItem } from "../models/common/api.model";

interface ErrorMessageContext {
  code?: string;
  field?: string;
}

const normalizeMessage = (message: string) => message.replace(/\s+/g, " ").trim();

const ERROR_MESSAGE_TRANSLATIONS: Record<string, string> = {
  "Request failed": "Yêu cầu thất bại.",
  "Network Error": "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.",
  "Invalid request data": "Dữ liệu gửi lên không hợp lệ.",
  "Request body is invalid": "Nội dung yêu cầu không hợp lệ.",
  "Request binding is invalid": "Ràng buộc của yêu cầu không hợp lệ.",
  "Multipart request is invalid": "Yêu cầu tải tệp không hợp lệ.",
  "Uploaded file is too large": "Tệp tải lên quá lớn.",
  "HTTP method is not supported for this endpoint": "Phương thức HTTP không được hỗ trợ cho endpoint này.",
  "Content type is not supported": "Định dạng nội dung không được hỗ trợ.",
  "Requested media type is not acceptable": "Định dạng phản hồi được yêu cầu không được hỗ trợ.",
  "Endpoint not found": "Không tìm thấy endpoint.",
  "Authentication required": "Vui lòng đăng nhập để tiếp tục.",
  "Permission denied": "Bạn không có quyền thực hiện thao tác này.",
  "Permission denied for test": "Bạn không có quyền thực hiện thao tác này.",
  "Request cannot be processed": "Yêu cầu không thể xử lý.",
  "An unexpected error occurred": "Đã xảy ra lỗi không mong muốn.",

  "Incorrect username or password": "Email hoặc mật khẩu không chính xác.",
  "Email verification is required before login": "Tài khoản chưa được xác thực email trước khi đăng nhập.",
  "Email already exists": "Email đã tồn tại.",
  "Email must be unique": "Email đã được sử dụng.",
  "Current password is incorrect": "Mật khẩu hiện tại không chính xác.",
  "New password must be different from current password": "Mật khẩu mới phải khác mật khẩu hiện tại.",
  "Password confirmation does not match": "Mật khẩu xác nhận không khớp.",
  "Reset password token is invalid or expired": "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.",
  "Verification code has expired": "Mã xác thực đã hết hạn.",
  "Verification code is invalid": "Mã xác thực không hợp lệ.",
  "The account has already been verified": "Tài khoản đã được xác thực.",
  "No pending registration verification found for the provided email": "Không tìm thấy yêu cầu xác thực đang chờ cho email này.",

  "User account not found": "Không tìm thấy tài khoản người dùng.",
  "Account not found": "Không tìm thấy tài khoản.",
  "Customer not found": "Không tìm thấy khách hàng.",
  "Customer profile not found": "Không tìm thấy hồ sơ khách hàng.",
  "Customer is already inactive": "Khách hàng đã ở trạng thái ngừng hoạt động.",
  "Tax code already exists": "Mã số thuế đã tồn tại.",
  "Customer credit limit would be exceeded": "Khách hàng sẽ vượt hạn mức tín dụng.",
  "Customer profile must be ACTIVE": "Hồ sơ khách hàng phải đang hoạt động.",
  "Customer must be ACTIVE": "Khách hàng phải đang hoạt động.",
  "Customer must be ACTIVE before submission": "Khách hàng phải đang hoạt động trước khi gửi duyệt.",
  "Email is required when creating portal account": "Email là bắt buộc khi tạo tài khoản portal.",
  "Email is already used by another portal account": "Email đã được tài khoản portal khác sử dụng.",

  "Product not found": "Không tìm thấy sản phẩm.",
  "Product code already exists": "Mã sản phẩm đã tồn tại.",
  "Product code must be unique": "Mã sản phẩm phải là duy nhất.",
  "Product is archived": "Sản phẩm đã được lưu trữ.",
  "One or more products do not exist": "Một hoặc nhiều sản phẩm không tồn tại.",
  "Duplicate product is not allowed": "Không được chọn trùng sản phẩm.",
  "Duplicate productId is not allowed": "Không được chọn trùng sản phẩm.",
  "Product deletion requires owner approval by policy": "Việc xóa sản phẩm cần chủ sở hữu phê duyệt theo chính sách.",
  "Unable to load product list": "Không thể tải danh sách sản phẩm.",
  "Failed to store uploaded image": "Không thể lưu ảnh tải lên.",
  "At least one image is required": "Vui lòng tải lên ít nhất một ảnh.",
  "Uploaded files must not be empty": "Tệp tải lên không được rỗng.",
  "Uploaded files must contain a valid extension": "Tệp tải lên phải có phần mở rộng hợp lệ.",
  "Each image URL must not exceed 500 characters": "Mỗi URL ảnh không được vượt quá 500 ký tự.",

  "Price list not found": "Không tìm thấy bảng giá.",
  "Price list cannot be deleted because it is used by active orders": "Không thể xóa bảng giá vì đang được dùng bởi đơn hàng hoạt động.",
  "No valid price list is available for one or more products": "Không có bảng giá hợp lệ cho một hoặc nhiều sản phẩm.",
  "Invalid date range": "Khoảng thời gian không hợp lệ.",
  "Valid from must be on or before valid to": "Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.",
  "Minimum amount must be less than or equal to maximum amount": "Số tiền tối thiểu phải nhỏ hơn hoặc bằng số tiền tối đa.",

  "Promotion not found": "Không tìm thấy khuyến mãi.",
  "Promotion code is invalid or not applicable": "Mã khuyến mãi không hợp lệ hoặc không thể áp dụng.",
  "Promotion cannot be deleted because it is applied to active orders": "Không thể xóa khuyến mãi vì đang áp dụng cho đơn hàng hoạt động.",
  "Discount value must be greater than 0": "Giá trị giảm giá phải lớn hơn 0.",
  "Percent discount must not exceed 100": "Phần trăm giảm giá không được vượt quá 100.",
  "Status must be DRAFT, ACTIVE, or INACTIVE": "Trạng thái phải là DRAFT, ACTIVE hoặc INACTIVE.",
  "Promotion type must be PERCENT or FIXED_AMOUNT": "Loại khuyến mãi phải là PERCENT hoặc FIXED_AMOUNT.",
  "Duplicate customer group is not allowed": "Không được chọn trùng nhóm khách hàng.",

  "Quotation not found": "Không tìm thấy báo giá.",
  "Quotation has already been converted to contract": "Báo giá đã được chuyển thành hợp đồng.",
  "Quotation total amount must be at least 10,000,000 VND": "Tổng tiền báo giá phải tối thiểu 10.000.000 VND.",
  "Only draft quotation can be edited": "Chỉ báo giá nháp mới có thể chỉnh sửa.",
  "Only draft quotation can be submitted": "Chỉ báo giá nháp mới có thể gửi duyệt.",
  "At least one quotation item is required": "Vui lòng thêm ít nhất một dòng hàng vào báo giá.",
  "Quotation can contain at most 20 items": "Báo giá chỉ được có tối đa 20 dòng hàng.",
  "Project is invalid or does not belong to the current customer": "Dự án không hợp lệ hoặc không thuộc khách hàng hiện tại.",
  "Payment option is invalid or inactive": "Phương án thanh toán không hợp lệ hoặc không còn hoạt động.",

  "Contract not found": "Không tìm thấy hợp đồng.",
  "Contract document not found": "Không tìm thấy tài liệu hợp đồng.",
  "Pending contract approval not found": "Không tìm thấy yêu cầu duyệt hợp đồng đang chờ.",
  "Only draft contract can be edited": "Chỉ hợp đồng nháp mới có thể chỉnh sửa.",
  "Quotation is not eligible for contract creation": "Báo giá chưa đủ điều kiện để tạo hợp đồng.",
  "Only draft or customer-approved contract can be progressed": "Chỉ hợp đồng nháp hoặc đã được khách hàng duyệt mới có thể chuyển bước.",
  "Only contract pending customer approval can be approved by customer": "Chỉ hợp đồng đang chờ khách hàng duyệt mới có thể được khách hàng phê duyệt.",
  "Only contract pending customer approval can be rejected by customer": "Chỉ hợp đồng đang chờ khách hàng duyệt mới có thể bị khách hàng từ chối.",
  "Only customer-approved contract can be rejected by accountant": "Chỉ hợp đồng đã được khách hàng duyệt mới có thể bị kế toán từ chối.",
  "Payment terms are required before submission": "Điều khoản thanh toán là bắt buộc trước khi gửi duyệt.",
  "Delivery address is required before submission": "Địa chỉ giao hàng là bắt buộc trước khi gửi duyệt.",
  "At least one contract item is required before submission": "Vui lòng thêm ít nhất một dòng hàng hợp đồng trước khi gửi duyệt.",
  "At least one contract item is required": "Vui lòng thêm ít nhất một dòng hàng hợp đồng.",
  "Contract already has a pending approval": "Hợp đồng đã có yêu cầu phê duyệt đang chờ.",
  "Completed, delivered, or cancelled contract cannot be cancelled": "Không thể hủy hợp đồng đã hoàn tất, đã giao hoặc đã hủy.",
  "Confidential contract documents require stronger internal access": "Tài liệu hợp đồng bảo mật yêu cầu quyền truy cập nội bộ cao hơn.",
  "Quotation does not belong to selected customer": "Báo giá không thuộc khách hàng đã chọn.",
  "Quotation is not valid for contract conversion": "Báo giá không hợp lệ để chuyển thành hợp đồng.",
  "Quotation has expired": "Báo giá đã hết hạn.",
  "Customer ID or quotation ID is required": "Vui lòng chọn khách hàng hoặc báo giá.",
  "Customer cannot be changed once contract draft is created": "Không thể đổi khách hàng sau khi hợp đồng nháp đã được tạo.",

  "Sale order not found": "Không tìm thấy đơn bán.",
  "Sale order is already in the requested status": "Đơn bán đã ở trạng thái được yêu cầu.",
  "Terminal sale orders cannot change status": "Đơn bán ở trạng thái cuối không thể đổi trạng thái.",
  "Sale order is not yet executable": "Đơn bán chưa thể thực hiện.",
  "Invalid sale order status transition": "Chuyển trạng thái đơn bán không hợp lệ.",
  "All sale order items must be fully issued before continuing": "Tất cả dòng hàng của đơn bán phải được xuất kho đầy đủ trước khi tiếp tục.",
  "All sale order items must be fully delivered before completion": "Tất cả dòng hàng của đơn bán phải được giao đầy đủ trước khi hoàn tất.",
  "Insufficient inventory to reserve the sale order": "Không đủ tồn kho để giữ hàng cho đơn bán.",
  "Inventory issue is not allowed for the current sale order status": "Không thể xuất kho ở trạng thái hiện tại của đơn bán.",
  "Product does not belong to the selected sale order": "Sản phẩm không thuộc đơn bán đã chọn.",
  "Issued quantity exceeds ordered quantity": "Số lượng xuất vượt quá số lượng đã đặt.",

  "Invoice not found": "Không tìm thấy hóa đơn.",
  "Payment not found": "Không tìm thấy thanh toán.",
  "Payment confirmation request not found": "Không tìm thấy yêu cầu xác nhận thanh toán.",
  "Invoice already has a pending payment confirmation request": "Hóa đơn đã có yêu cầu xác nhận thanh toán đang chờ.",
  "Invoice is not eligible for payment confirmation": "Hóa đơn chưa đủ điều kiện để xác nhận thanh toán.",
  "Invoice has no outstanding balance": "Hóa đơn không còn dư nợ.",
  "Only pending payment confirmation requests can be reviewed": "Chỉ yêu cầu xác nhận thanh toán đang chờ mới có thể được duyệt.",
  "Contract already has an active invoice": "Hợp đồng đã có hóa đơn đang hoạt động.",
  "Only draft or issued invoices can be updated before payment": "Chỉ hóa đơn nháp hoặc đã phát hành mới có thể cập nhật trước khi thanh toán.",
  "Invoice with recorded payment cannot be updated": "Không thể cập nhật hóa đơn đã ghi nhận thanh toán.",
  "Issued invoice date cannot be changed": "Không thể thay đổi ngày phát hành hóa đơn.",
  "Payment terms cannot be shortened after invoice issue": "Không thể rút ngắn thời hạn thanh toán sau khi hóa đơn đã phát hành.",
  "Amount increases greater than 5% require finance approval": "Tăng số tiền quá 5% cần phê duyệt tài chính.",
  "Invoice is already cancelled": "Hóa đơn đã bị hủy.",
  "Refund is required before cancelling an invoice with received payment": "Cần hoàn tiền trước khi hủy hóa đơn đã nhận thanh toán.",
  "Contract is missing customer information": "Hợp đồng thiếu thông tin khách hàng.",
  "Invoice can only be created from a delivered or completed sale order": "Chỉ có thể tạo hóa đơn từ đơn bán đã giao hoặc đã hoàn tất.",
  "Contract does not contain billable items": "Hợp đồng không có dòng hàng có thể lập hóa đơn.",
  "Invoice must contain at least one item": "Hóa đơn phải có ít nhất một dòng hàng.",
  "Existing invoice does not contain billable items": "Hóa đơn hiện tại không có dòng hàng có thể lập hóa đơn.",
  "Invoice total amount must be greater than 0": "Tổng tiền hóa đơn phải lớn hơn 0.",
  "Payment amount exceeds outstanding balance": "Số tiền thanh toán vượt quá dư nợ.",
  "Duplicate payment detected": "Phát hiện thanh toán bị trùng.",
  "Allocation amount exceeds invoice outstanding balance": "Số tiền phân bổ vượt quá dư nợ của hóa đơn.",
  "Allocated invoice does not belong to the selected customer": "Hóa đơn phân bổ không thuộc khách hàng đã chọn.",
  "Allocated invoice is not open for payment": "Hóa đơn phân bổ chưa mở để thanh toán.",
  "One or more allocated invoices were not found": "Không tìm thấy một hoặc nhiều hóa đơn được phân bổ.",
  "Allocated invoice is already fully paid": "Hóa đơn được phân bổ đã được thanh toán đủ.",
  "Duplicate invoice allocation is not allowed": "Không được phân bổ trùng hóa đơn.",
  "Allocation total must equal payment amount": "Tổng phân bổ phải bằng số tiền thanh toán.",
  "Payment allocation must follow FIFO across open invoices": "Phân bổ thanh toán phải theo FIFO trên các hóa đơn còn mở.",
  "Only CONFIRMED payment status is supported": "Chỉ hỗ trợ trạng thái thanh toán CONFIRMED.",
  "Cash payments over 50,000,000 VND require dual approval and are not supported in this API": "Thanh toán tiền mặt trên 50.000.000 VND cần duyệt hai cấp và chưa được hỗ trợ trong API này.",

  "Project not found": "Không tìm thấy dự án.",
  "Project milestone not found": "Không tìm thấy mốc dự án.",
  "Project progress update not found": "Không tìm thấy bản cập nhật tiến độ dự án.",
  "Project can no longer be restored": "Dự án không thể khôi phục nữa.",
  "Project cannot be archived because active dependencies or transactions still exist": "Không thể lưu trữ dự án vì vẫn còn phụ thuộc hoặc giao dịch đang hoạt động.",
  "Archived project cannot be closed": "Không thể đóng dự án đã lưu trữ.",
  "Project is already closed": "Dự án đã được đóng.",
  "All milestones must be confirmed before closing": "Tất cả mốc dự án phải được xác nhận trước khi đóng.",
  "Project still has open related orders": "Dự án vẫn còn đơn hàng liên quan chưa đóng.",
  "Project still has unresolved issues": "Dự án vẫn còn vấn đề chưa xử lý.",
  "Project still has an active contract dependency": "Dự án vẫn còn phụ thuộc hợp đồng đang hoạt động.",
  "Project cannot be closed while invoices or payments remain unsettled": "Không thể đóng dự án khi hóa đơn hoặc thanh toán còn chưa quyết toán.",
  "Project cannot be closed while debts remain outstanding": "Không thể đóng dự án khi vẫn còn công nợ.",
  "Customer sign-off is required before closing": "Cần khách hàng xác nhận trước khi đóng dự án.",
  "Customers can only view their own projects": "Khách hàng chỉ có thể xem dự án của chính mình.",
  "Customers can only confirm milestones for their own projects": "Khách hàng chỉ có thể xác nhận mốc của dự án của chính mình.",
  "Customers can only access their own projects": "Khách hàng chỉ có thể truy cập dự án của chính mình.",
  "Closed or archived project cannot be modified": "Không thể chỉnh sửa dự án đã đóng hoặc đã lưu trữ.",
  "At least 3 payment milestones are required": "Cần ít nhất 3 mốc thanh toán.",
  "Milestone completion percent must be unique": "Phần trăm hoàn thành của mốc không được trùng.",
  "Warehouse not found": "Không tìm thấy kho.",
  "Primary warehouse is not serviceable": "Kho chính không khả dụng.",
  "Backup warehouse is not serviceable": "Kho dự phòng không khả dụng.",
  "Backup warehouse must be different from primary warehouse": "Kho dự phòng phải khác kho chính.",
  "Linked contract not found": "Không tìm thấy hợp đồng liên kết.",
  "Linked contract must belong to the same customer": "Hợp đồng liên kết phải thuộc cùng khách hàng.",
  "New project status must be DRAFT, ACTIVE, or ON_HOLD": "Trạng thái dự án mới phải là DRAFT, ACTIVE hoặc ON_HOLD.",
  "Use dedicated APIs to close or archive a project": "Vui lòng dùng API riêng để đóng hoặc lưu trữ dự án.",
  "Invalid project status": "Trạng thái dự án không hợp lệ.",
  "Invalid document type": "Loại tài liệu không hợp lệ.",
  "Progress status COMPLETED requires 100% progress": "Trạng thái COMPLETED yêu cầu tiến độ đạt 100%.",
  "Invalid progress status": "Trạng thái tiến độ không hợp lệ.",
  "Change reason is required when progress decreases": "Vui lòng nhập lý do khi tiến độ giảm.",
  "Progress percent must be between 0 and 100": "Phần trăm tiến độ phải từ 0 đến 100.",
  "Budget cannot be lower than actual spend or committed amount": "Ngân sách không được thấp hơn chi phí thực tế hoặc số tiền đã cam kết.",

  "Insufficient inventory available": "Không đủ tồn kho khả dụng.",
  "Requested quantity exceeds available stock": "Số lượng yêu cầu vượt quá tồn kho hiện có.",
  "Resulting stock cannot be negative": "Tồn kho sau điều chỉnh không được âm.",
  "adjustmentQuantity must not be zero": "Số lượng điều chỉnh không được bằng 0.",
  "reason or note is required": "Vui lòng nhập lý do hoặc ghi chú.",
  "transactionType must be RECEIPT, ISSUE, or ADJUSTMENT": "Loại giao dịch phải là RECEIPT, ISSUE hoặc ADJUSTMENT.",

  "Customer has no open invoices": "Khách hàng không có hóa đơn đang mở.",
  "Customer does not have a valid email address": "Khách hàng chưa có địa chỉ email hợp lệ.",
  "Reminder can only be sent for overdue invoices": "Chỉ có thể gửi nhắc nợ cho hóa đơn quá hạn.",
  "Outstanding balance must be zero before settlement can be confirmed": "Dư nợ phải bằng 0 trước khi xác nhận quyết toán.",
  "All related invoices must be fully paid before settlement confirmation": "Tất cả hóa đơn liên quan phải được thanh toán đủ trước khi xác nhận quyết toán.",
  "Only EMAIL reminder channel is currently supported": "Hiện chỉ hỗ trợ kênh nhắc nợ EMAIL.",

  "Role is invalid": "Vai trò không hợp lệ.",
  "Role must be ACCOUNTANT or WAREHOUSE": "Vai trò phải là ACCOUNTANT hoặc WAREHOUSE.",
  "Owner cannot change own role": "Chủ sở hữu không thể tự đổi vai trò của mình.",
  "Invalid user role": "Vai trò người dùng không hợp lệ.",
  "Required role is not configured": "Vai trò bắt buộc chưa được cấu hình.",

  "You do not have permission to perform this action": "Bạn không có quyền thực hiện thao tác này.",
  "You do not have permission to access sale orders": "Bạn không có quyền truy cập đơn bán.",
  "You do not have permission to view sale orders": "Bạn không có quyền xem đơn bán.",
  "You do not have permission to manage sale orders": "Bạn không có quyền quản lý đơn bán.",
  "You do not have permission to view promotions": "Bạn không có quyền xem khuyến mãi.",
  "You do not have permission to view inventory": "Bạn không có quyền xem tồn kho.",
  "You do not have permission to access this project": "Bạn không có quyền truy cập dự án này.",
  "You do not have permission to archive products": "Bạn không có quyền lưu trữ sản phẩm.",
  "You do not have permission to view price lists": "Bạn không có quyền xem bảng giá.",
  "You do not have permission to view payment confirmation requests": "Bạn không có quyền xem yêu cầu xác nhận thanh toán.",
  "You do not have permission to view invoices": "Bạn không có quyền xem hóa đơn.",
  "Only owner can manage promotions": "Chỉ chủ sở hữu mới có thể quản lý khuyến mãi.",
  "Only owner can manage price lists": "Chỉ chủ sở hữu mới có thể quản lý bảng giá.",
  "Only accountant users can perform this action": "Chỉ kế toán mới có thể thực hiện thao tác này.",
  "Only customer users can perform this action": "Chỉ khách hàng mới có thể thực hiện thao tác này.",
  "Only warehouse users can perform inventory transactions": "Chỉ người dùng kho mới có thể thực hiện giao dịch tồn kho.",
  "Only warehouse users can manage products": "Chỉ người dùng kho mới có thể quản lý sản phẩm.",
  "Only accountant users can create invoices from sale orders": "Chỉ kế toán mới có thể tạo hóa đơn từ đơn bán.",
  "Only accountant users can manage invoices": "Chỉ kế toán mới có thể quản lý hóa đơn.",
  "Only accountant or owner users can review payment confirmation requests": "Chỉ kế toán hoặc chủ sở hữu mới có thể duyệt yêu cầu xác nhận thanh toán.",
  "Only customer users can create payment confirmation requests": "Chỉ khách hàng mới có thể tạo yêu cầu xác nhận thanh toán.",
  "Only accountant and customer users can access debt information": "Chỉ kế toán và khách hàng mới có thể truy cập thông tin công nợ.",
};

const ERROR_CODE_TRANSLATIONS: Record<string, string> = {
  VALIDATION_ERROR: "Dữ liệu gửi lên không hợp lệ.",
  UNAUTHORIZED: "Vui lòng đăng nhập để tiếp tục.",
  FORBIDDEN: "Bạn không có quyền thực hiện thao tác này.",
  INVALID_CREDENTIALS: "Email hoặc mật khẩu không chính xác.",
  EMAIL_VERIFICATION_REQUIRED: "Tài khoản chưa được xác thực email trước khi đăng nhập.",
  EMAIL_ALREADY_EXISTS: "Email đã tồn tại.",
  CURRENT_PASSWORD_INCORRECT: "Mật khẩu hiện tại không chính xác.",
  PASSWORD_MISMATCH: "Mật khẩu xác nhận không khớp.",
  INVALID_RESET_TOKEN: "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.",
  ACCOUNT_LOGIN_BLOCKED: "Tài khoản đang bị chặn đăng nhập.",
  PRODUCT_CODE_ALREADY_EXISTS: "Mã sản phẩm đã tồn tại.",
  INSUFFICIENT_INVENTORY: "Không đủ tồn kho khả dụng.",
  PAYLOAD_TOO_LARGE: "Tệp tải lên quá lớn.",
  METHOD_NOT_ALLOWED: "Phương thức HTTP không được hỗ trợ cho endpoint này.",
  UNSUPPORTED_MEDIA_TYPE: "Định dạng nội dung không được hỗ trợ.",
  NOT_ACCEPTABLE: "Định dạng phản hồi được yêu cầu không được hỗ trợ.",
  ENDPOINT_NOT_FOUND: "Không tìm thấy endpoint.",
  INTERNAL_SERVER_ERROR: "Đã xảy ra lỗi không mong muốn.",
};

const FIELD_LABELS: Record<string, string> = {
  accept: "Header Accept",
  accountId: "Tài khoản",
  actualSpend: "Chi phí thực tế",
  address: "Địa chỉ",
  adjustmentAmount: "Số tiền điều chỉnh",
  adjustmentQuantity: "Số lượng điều chỉnh",
  allocatedAmount: "Số tiền phân bổ",
  allocations: "Phân bổ thanh toán",
  amount: "Số tiền",
  assignmentReason: "Lý do gán kho",
  backupWarehouseId: "Kho dự phòng",
  billingAddress: "Địa chỉ thanh toán",
  budget: "Ngân sách",
  cancellationReason: "Lý do hủy",
  channel: "Kênh",
  changeReason: "Lý do thay đổi",
  closeReason: "Lý do đóng",
  code: "Mã",
  comment: "Bình luận",
  commitments: "Số tiền cam kết",
  companyName: "Tên công ty",
  confirmNewPassword: "Xác nhận mật khẩu mới",
  confirmPassword: "Xác nhận mật khẩu",
  contactPerson: "Người liên hệ",
  contentType: "Loại nội dung",
  contractId: "Hợp đồng",
  contractNumber: "Số hợp đồng",
  createdFrom: "Ngày tạo từ",
  createdTo: "Ngày tạo đến",
  creditLimit: "Hạn mức tín dụng",
  currentPassword: "Mật khẩu hiện tại",
  customer: "Khách hàng",
  customerGroup: "Nhóm khách hàng",
  customerGroups: "Nhóm khách hàng",
  customerId: "Khách hàng",
  customerType: "Loại khách hàng",
  deliveryAddress: "Địa chỉ giao hàng",
  deliveryFrom: "Ngày giao từ",
  deliveryTerms: "Điều khoản giao hàng",
  deliveryTo: "Ngày giao đến",
  description: "Mô tả",
  discountValue: "Giá trị giảm giá",
  documentType: "Loại tài liệu",
  documentUrl: "URL tài liệu",
  dueDate: "Ngày đến hạn",
  email: "Email",
  endDate: "Ngày kết thúc",
  eventFrom: "Thời gian sự kiện từ",
  eventStatus: "Trạng thái sự kiện",
  eventTo: "Thời gian sự kiện đến",
  eventType: "Loại sự kiện",
  evidenceDocuments: "Tài liệu minh chứng",
  fileName: "Tên tệp",
  fileUrl: "URL tệp",
  files: "Tệp",
  fullName: "Họ và tên",
  imageUrls: "URL ảnh",
  invoiceId: "Hóa đơn",
  invoiceIds: "Hóa đơn",
  issueDate: "Ngày phát hành",
  items: "Dòng hàng",
  linkedContractId: "Hợp đồng liên kết",
  linkedOrderReference: "Mã đơn hàng liên kết",
  location: "Địa điểm",
  maxAmount: "Số tiền tối đa",
  method: "Phương thức",
  milestoneId: "Mốc dự án",
  name: "Tên",
  newPassword: "Mật khẩu mới",
  note: "Ghi chú",
  notes: "Ghi chú",
  orderFrom: "Ngày đặt hàng từ",
  orderTo: "Ngày đặt hàng đến",
  outstandingBalance: "Dư nợ",
  page: "Trang",
  pageSize: "Kích thước trang",
  password: "Mật khẩu",
  paymentDate: "Ngày thanh toán",
  paymentMethod: "Phương thức thanh toán",
  paymentMilestones: "Mốc thanh toán",
  paymentOptionCode: "Phương án thanh toán",
  paymentTerms: "Điều khoản thanh toán",
  phone: "Số điện thoại",
  priceGroup: "Nhóm giá",
  pricingRuleType: "Quy tắc giá",
  primaryWarehouseId: "Kho chính",
  priority: "Độ ưu tiên",
  productCode: "Mã sản phẩm",
  productId: "Sản phẩm",
  productIds: "Sản phẩm",
  productName: "Tên sản phẩm",
  progressPercent: "Phần trăm tiến độ",
  progressStatus: "Trạng thái tiến độ",
  progressUpdateId: "Bản cập nhật tiến độ",
  promotionCode: "Mã khuyến mãi",
  promotionType: "Loại khuyến mãi",
  quantity: "Số lượng",
  quotationId: "Báo giá",
  reason: "Lý do",
  receiptDate: "Ngày nhập kho",
  recipientEmail: "Email người nhận",
  referenceNo: "Mã tham chiếu",
  referenceWeight: "Khối lượng tham chiếu",
  relatedOrderId: "Đơn hàng liên quan",
  relatedProjectId: "Dự án liên quan",
  reminderType: "Loại nhắc nợ",
  requestedAmount: "Số tiền yêu cầu",
  request: "Yêu cầu",
  requestId: "Yêu cầu",
  role: "Vai trò",
  roleId: "Vai trò",
  scope: "Phạm vi",
  search: "Từ khóa tìm kiếm",
  size: "Kích thước",
  sortBy: "Trường sắp xếp",
  sortDir: "Chiều sắp xếp",
  startDate: "Ngày bắt đầu",
  status: "Trạng thái",
  supplierName: "Nhà cung cấp",
  taxCode: "Mã số thuế",
  thickness: "Độ dày",
  token: "Token",
  totalAmount: "Tổng tiền",
  trackingNumber: "Mã vận chuyển",
  transactionType: "Loại giao dịch",
  transferTime: "Thời gian chuyển khoản",
  type: "Loại",
  unit: "Đơn vị",
  unitPrice: "Đơn giá",
  unitPriceVnd: "Đơn giá VND",
  validFrom: "Ngày hiệu lực từ",
  validTo: "Ngày hiệu lực đến",
  verificationCode: "Mã xác thực",
  weightConversion: "Hệ số quy đổi khối lượng",
};

const SUBJECT_TRANSLATIONS: Record<string, string> = {
  Account: "Tài khoản",
  "Account ID": "Mã tài khoản",
  Address: "Địa chỉ",
  Amount: "Số tiền",
  "Applicable customer group": "Nhóm khách hàng áp dụng",
  "Archive reason": "Lý do lưu trữ",
  "Assigned project manager": "Quản lý dự án",
  "Backup warehouse ID": "Kho dự phòng",
  Budget: "Ngân sách",
  "Cancellation note": "Ghi chú hủy",
  "Cancellation reason": "Lý do hủy",
  Channel: "Kênh",
  "Change reason": "Lý do thay đổi",
  "Close reason": "Lý do đóng",
  "Completion percent": "Phần trăm hoàn thành",
  "Confirm new password": "Xác nhận mật khẩu mới",
  "Confirm password": "Xác nhận mật khẩu",
  "Content type": "Loại nội dung",
  "Contract item unitPrice": "Đơn giá dòng hàng hợp đồng",
  "Contract item": "Dòng hàng hợp đồng",
  Customer: "Khách hàng",
  "Customer ID": "Khách hàng",
  "Customer group": "Nhóm khách hàng",
  "Customer satisfaction score": "Điểm hài lòng của khách hàng",
  "Customer type": "Loại khách hàng",
  Description: "Mô tả",
  "Discount value": "Giá trị giảm giá",
  "Document type": "Loại tài liệu",
  Email: "Email",
  "End date": "Ngày kết thúc",
  "File URL": "URL tệp",
  "File name": "Tên tệp",
  "Full name": "Họ và tên",
  "Invoice ID": "Hóa đơn",
  "Item ID": "Dòng hàng",
  "Linked contract ID": "Hợp đồng liên kết",
  "Linked order reference": "Mã đơn hàng liên kết",
  "Milestone name": "Tên mốc",
  "Milestone notes": "Ghi chú mốc",
  "Milestone type": "Loại mốc",
  "Minimum amount": "Số tiền tối thiểu",
  Name: "Tên",
  "New password": "Mật khẩu mới",
  Note: "Ghi chú",
  Notes: "Ghi chú",
  Page: "Trang",
  "Page size": "Kích thước trang",
  Password: "Mật khẩu",
  "Payment terms": "Điều khoản thanh toán",
  Phase: "Giai đoạn",
  Phone: "Số điện thoại",
  "Price group": "Nhóm giá",
  "Pricing rule type": "Quy tắc giá",
  "Primary warehouse ID": "Kho chính",
  Product: "Sản phẩm",
  "Product ID": "Sản phẩm",
  "Product code": "Mã sản phẩm",
  "Product id": "Sản phẩm",
  "Product name": "Tên sản phẩm",
  "Progress percent": "Phần trăm tiến độ",
  "Progress status": "Trạng thái tiến độ",
  "Project location": "Địa điểm dự án",
  "Project name": "Tên dự án",
  "Project scope": "Phạm vi dự án",
  "Promotion name": "Tên khuyến mãi",
  "Promotion type": "Loại khuyến mãi",
  Quantity: "Số lượng",
  "Quotation ID": "Báo giá",
  "Reference weight": "Khối lượng tham chiếu",
  "Requested amount": "Số tiền yêu cầu",
  Role: "Vai trò",
  Search: "Từ khóa tìm kiếm",
  Size: "Kích thước",
  "Start date": "Ngày bắt đầu",
  Status: "Trạng thái",
  "Tax code": "Mã số thuế",
  Thickness: "Độ dày",
  Token: "Token",
  Type: "Loại",
  Unit: "Đơn vị",
  "Unit price": "Đơn giá",
  "Unit price in VND": "Đơn giá VND",
  "Valid from": "Ngày hiệu lực từ",
  "Valid to": "Ngày hiệu lực đến",
  "Verification code": "Mã xác thực",
};

const normalizeFieldKey = (field?: string) => {
  if (!field) {
    return undefined;
  }

  const withoutIndex = field.replace(/\[\d+\]/g, "");
  const parts = withoutIndex.split(".");
  return parts[parts.length - 1] || withoutIndex;
};

const humanizeIdentifier = (value: string) =>
  value
    .replace(/\[\d+\]/g, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .trim();

const translateSubject = (subject: string, field?: string) => {
  const normalizedSubject = normalizeMessage(subject);
  const fieldKey = normalizeFieldKey(field);
  if (fieldKey && FIELD_LABELS[fieldKey]) {
    return FIELD_LABELS[fieldKey];
  }

  if (FIELD_LABELS[normalizedSubject]) {
    return FIELD_LABELS[normalizedSubject];
  }

  if (SUBJECT_TRANSLATIONS[normalizedSubject]) {
    return SUBJECT_TRANSLATIONS[normalizedSubject];
  }

  const humanized = humanizeIdentifier(normalizedSubject);
  return SUBJECT_TRANSLATIONS[humanized] ?? humanized;
};

const translateList = (value: string) => value.replace(/, or /g, ", hoặc ").replace(/ or /g, " hoặc ");

const ROLE_TRANSLATIONS: Record<string, string> = {
  accountant: "kế toán",
  customer: "khách hàng",
  owner: "chủ sở hữu",
  warehouse: "kho",
};

const ACTION_TRANSLATIONS: Record<string, string> = {
  "access debt information": "truy cập thông tin công nợ",
  "access sale orders": "truy cập đơn bán",
  "access this project": "truy cập dự án này",
  "archive products": "lưu trữ sản phẩm",
  "confirm milestones for their own projects": "xác nhận mốc của dự án của chính mình",
  "create invoices from sale orders": "tạo hóa đơn từ đơn bán",
  "create payment confirmation requests": "tạo yêu cầu xác nhận thanh toán",
  "manage invoices": "quản lý hóa đơn",
  "manage price lists": "quản lý bảng giá",
  "manage products": "quản lý sản phẩm",
  "manage promotions": "quản lý khuyến mãi",
  "manage sale orders": "quản lý đơn bán",
  "perform inventory transactions": "thực hiện giao dịch tồn kho",
  "perform this action": "thực hiện thao tác này",
  "review payment confirmation requests": "duyệt yêu cầu xác nhận thanh toán",
  "view debt information": "xem thông tin công nợ",
  "view inventory": "xem tồn kho",
  "view invoices": "xem hóa đơn",
  "view payment confirmation requests": "xem yêu cầu xác nhận thanh toán",
  "view price lists": "xem bảng giá",
  "view promotions": "xem khuyến mãi",
  "view sale orders": "xem đơn bán",
  "view their own projects": "xem dự án của chính mình",
};

const translateRolePhrase = (value: string) =>
  value
    .split(/\s+(and|or)\s+/)
    .map((part) => {
      if (part === "and") {
        return "và";
      }

      if (part === "or") {
        return "hoặc";
      }

      return ROLE_TRANSLATIONS[part] ?? part;
    })
    .join(" ");

const translateActionPhrase = (value: string) => ACTION_TRANSLATIONS[value] ?? value;

const translatePatternMessage = (message: string, context: ErrorMessageContext): string | undefined => {
  let match = /^Request failed with status code (\d+)$/.exec(message);
  if (match) {
    return `Yêu cầu thất bại với mã trạng thái ${match[1]}.`;
  }

  match = /^timeout of (\d+)ms exceeded$/.exec(message);
  if (match) {
    return `Yêu cầu quá thời gian chờ sau ${match[1]}ms.`;
  }

  match = /^Account is (.+) and cannot login$/.exec(message);
  if (match) {
    return `Tài khoản đang ở trạng thái ${match[1]} nên không thể đăng nhập.`;
  }

  match = /^Please wait (\d+) seconds before requesting another verification code$/.exec(message);
  if (match) {
    return `Vui lòng chờ ${match[1]} giây trước khi yêu cầu mã xác thực mới.`;
  }

  match = /^No active pricing found for product: (.+)$/.exec(message);
  if (match) {
    return `Không tìm thấy giá đang hiệu lực cho sản phẩm ${match[1]}.`;
  }

  match = /^No valid price found for product: (.+)$/.exec(message);
  if (match) {
    return `Không tìm thấy giá hợp lệ cho sản phẩm ${match[1]}.`;
  }

  match = /^Promotion cannot be applied: (.+)$/.exec(message);
  if (match) {
    return `Không thể áp dụng khuyến mãi ${match[1]}.`;
  }

  match = /^Product must be ACTIVE: (.+)$/.exec(message);
  if (match) {
    return `Sản phẩm ${match[1]} phải đang hoạt động.`;
  }

  match = /^Product not found: (.+)$/.exec(message);
  if (match) {
    return `Không tìm thấy sản phẩm ${match[1]}.`;
  }

  match = /^Reminder limit reached for invoice (.+)$/.exec(message);
  if (match) {
    return `Hóa đơn ${match[1]} đã đạt giới hạn nhắc nợ.`;
  }

  match = /^Invoice (.+) is not an overdue open invoice for the selected customer$/.exec(message);
  if (match) {
    return `Hóa đơn ${match[1]} không phải hóa đơn mở quá hạn của khách hàng đã chọn.`;
  }

  match = /^Unit price for product (.+) is below allowed minimum$/.exec(message);
  if (match) {
    return `Đơn giá của sản phẩm ${match[1]} thấp hơn mức tối thiểu cho phép.`;
  }

  match = /^Insufficient inventory for product (.+)$/.exec(message);
  if (match) {
    return `Không đủ tồn kho cho sản phẩm ${match[1]}.`;
  }

  match = /^Required role is not configured: (.+)$/.exec(message);
  if (match) {
    return `Vai trò bắt buộc chưa được cấu hình: ${match[1]}.`;
  }

  match = /^(.+) is required$/.exec(message);
  if (match) {
    return `${translateSubject(match[1], context.field)} là bắt buộc.`;
  }

  match = /^(.+) are required$/.exec(message);
  if (match) {
    return `${translateSubject(match[1], context.field)} là bắt buộc.`;
  }

  match = /^(.+) must not contain blank values$/.exec(message);
  if (match) {
    return `${translateSubject(match[1], context.field)} không được chứa giá trị trống.`;
  }

  match = /^(.+) must not be empty$/.exec(message);
  if (match) {
    return `${translateSubject(match[1], context.field)} không được để trống.`;
  }

  match = /^(.+) must be unique$/.exec(message);
  if (match) {
    return `${translateSubject(match[1], context.field)} phải là duy nhất.`;
  }

  match = /^(.+) already exists$/.exec(message);
  if (match) {
    return `${translateSubject(match[1], context.field)} đã tồn tại.`;
  }

  match = /^(.+) not found$/.exec(message);
  if (match) {
    return `Không tìm thấy ${translateSubject(match[1], context.field).toLowerCase()}.`;
  }

  match = /^(.+) does not belong to (.+)$/.exec(message);
  if (match) {
    return `${translateSubject(match[1], context.field)} không thuộc ${translateSubject(match[2]).toLowerCase()}.`;
  }

  match = /^(.+) must not exceed (\d+) characters$/.exec(message);
  if (match) {
    return `${translateSubject(match[1], context.field)} không được vượt quá ${match[2]} ký tự.`;
  }

  match = /^(.+) must be at least (\d+) characters$/.exec(message);
  if (match) {
    return `${translateSubject(match[1], context.field)} phải có ít nhất ${match[2]} ký tự.`;
  }

  match = /^(.+) must be exactly (\d+) characters$/.exec(message);
  if (match) {
    return `${translateSubject(match[1], context.field)} phải có đúng ${match[2]} ký tự.`;
  }

  match = /^(.+) must be (\d+)-(\d+) digits$/.exec(message);
  if (match) {
    return `${translateSubject(match[1], context.field)} phải gồm ${match[2]} đến ${match[3]} chữ số.`;
  }

  match = /^(.+) must be (\d+)-(\d+) characters and contain only digits or common phone symbols$/.exec(message);
  if (match) {
    return `${translateSubject(match[1], context.field)} phải dài ${match[2]} đến ${match[3]} ký tự và chỉ chứa chữ số hoặc ký hiệu điện thoại thông dụng.`;
  }

  match = /^(.+) format is invalid$/.exec(message);
  if (match) {
    return `${translateSubject(match[1], context.field)} không đúng định dạng.`;
  }

  match = /^(.+) must be valid$/.exec(message);
  if (match) {
    return `${translateSubject(match[1], context.field)} không hợp lệ.`;
  }

  match = /^(.+) has invalid value$/.exec(message);
  if (match) {
    return `${translateSubject(match[1], context.field)} có giá trị không hợp lệ.`;
  }

  match = /^(.+) is invalid$/.exec(message);
  if (match) {
    return `${translateSubject(match[1], context.field)} không hợp lệ.`;
  }

  match = /^(.+) is not valid$/.exec(message);
  if (match) {
    return `${translateSubject(match[1], context.field)} không hợp lệ.`;
  }

  match = /^(.+) must be greater than or equal to (.+)$/.exec(message);
  if (match) {
    return `${translateSubject(match[1], context.field)} phải lớn hơn hoặc bằng ${match[2]}.`;
  }

  match = /^(.+) must be greater than (.+)$/.exec(message);
  if (match) {
    return `${translateSubject(match[1], context.field)} phải lớn hơn ${match[2]}.`;
  }

  match = /^(.+) must be at least (.+)$/.exec(message);
  if (match) {
    return `${translateSubject(match[1], context.field)} phải tối thiểu ${match[2]}.`;
  }

  match = /^(.+) must be less than or equal to (.+)$/.exec(message);
  if (match) {
    return `${translateSubject(match[1], context.field)} phải nhỏ hơn hoặc bằng ${match[2]}.`;
  }

  match = /^(.+) must be between (.+) and (.+)$/.exec(message);
  if (match) {
    return `${translateSubject(match[1], context.field)} phải nằm trong khoảng ${match[2]} đến ${match[3]}.`;
  }

  match = /^(.+) must be on or before (.+)$/.exec(message);
  if (match) {
    return `${translateSubject(match[1], context.field)} phải trước hoặc bằng ${translateSubject(match[2]).toLowerCase()}.`;
  }

  match = /^(.+) must be before or equal to (.+)$/.exec(message);
  if (match) {
    return `${translateSubject(match[1], context.field)} phải trước hoặc bằng ${translateSubject(match[2]).toLowerCase()}.`;
  }

  match = /^(.+) must be on or after (.+)$/.exec(message);
  if (match) {
    return `${translateSubject(match[1], context.field)} phải sau hoặc bằng ${translateSubject(match[2]).toLowerCase()}.`;
  }

  match = /^(.+) must be one of (.+)$/.exec(message);
  if (match) {
    return `${translateSubject(match[1], context.field)} phải là một trong: ${translateList(match[2])}.`;
  }

  match = /^At least one (.+) is required$/.exec(message);
  if (match) {
    return `Vui lòng thêm ít nhất một ${translateSubject(match[1], context.field).toLowerCase()}.`;
  }

  match = /^At least (\d+) (.+) are required$/.exec(message);
  if (match) {
    return `Cần ít nhất ${match[1]} ${translateSubject(match[2], context.field).toLowerCase()}.`;
  }

  match = /^Duplicate (.+) is not allowed$/.exec(message);
  if (match) {
    return `Không được nhập trùng ${translateSubject(match[1], context.field).toLowerCase()}.`;
  }

  match = /^Only (.+) users can (.+)$/.exec(message);
  if (match) {
    return `Chỉ người dùng ${translateRolePhrase(match[1])} mới có thể ${translateActionPhrase(match[2])}.`;
  }

  match = /^Only (.+) can (.+)$/.exec(message);
  if (match) {
    return `Chỉ ${translateRolePhrase(match[1])} mới có thể ${translateActionPhrase(match[2])}.`;
  }

  match = /^You do not have permission to (.+)$/.exec(message);
  if (match) {
    return `Bạn không có quyền ${translateActionPhrase(match[1])}.`;
  }

  match = /^(.+) cannot be (.+)$/.exec(message);
  if (match) {
    return `${translateSubject(match[1], context.field)} không thể ${match[2]}.`;
  }

  match = /^(.+) can only be (.+)$/.exec(message);
  if (match) {
    return `${translateSubject(match[1], context.field)} chỉ có thể ${match[2]}.`;
  }

  return undefined;
};

export const translateErrorMessage = (message: string, context: ErrorMessageContext = {}) => {
  const normalizedMessage = normalizeMessage(message);
  if (!normalizedMessage) {
    return normalizedMessage;
  }

  const exactTranslation = ERROR_MESSAGE_TRANSLATIONS[normalizedMessage];
  if (exactTranslation) {
    return exactTranslation;
  }

  const patternTranslation = translatePatternMessage(normalizedMessage, context);
  if (patternTranslation) {
    return patternTranslation;
  }

  if (context.code && normalizedMessage === context.code) {
    return ERROR_CODE_TRANSLATIONS[context.code] ?? normalizedMessage;
  }

  return normalizedMessage;
};

export const translateApiErrorItems = (errors?: ApiValidationErrorItem[], code?: string): ApiValidationErrorItem[] | undefined => {
  if (!errors?.length) {
    return undefined;
  }

  return errors.map((item) => ({
    ...item,
    message: translateErrorMessage(item.message, { code, field: item.field }),
  }));
};
