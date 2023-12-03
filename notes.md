### integrate order routes in all the pages
- complete cash on delivery gateway
- update checkout screen in order confirm
- in user profile show placed orders
- get all the orders data in admin panel

### in admin panel
- completely implement order management
    - add a new product
    - update a product
    - delete a product
    - update inventory of the product

### update pages
implement checkout
implement product description

pages left:
Face Care and three other pages of other categories
product description for each product
fix the home page


    <div class="mb-3 mt-5">
        <h4 class="d-flex justify-content-between align-items-center">
            <span class="text-white">Order Summary</span>
        </h4>
        <ul class="list-group mb-3" style="color: #000;">
            <li class="list-group-item d-flex justify-content-between">
                <span>Total (INR)</span>
                <strong>&#8377;99.00</strong>
            </li>
            <li class="list-group-item d-flex justify-content-between">
                <span>Shipping</span>
                <strong>&#8377;20.00</strong>
            </li>
            <li class="list-group-item d-flex justify-content-between">
                <div class="input-group input-group-sm">
                    <input type="text" class="form-control" placeholder="Enter discount code">
                    <div class="input-group-append">
                        <button class="btn btn-outline-secondary" type="button">Apply</button>
                    </div>
                </div>
            </li>
            <li class="list-group-item d-flex justify-content-between">
                <span>Total Payable</span>
                <strong>&#8377;119.00</strong>
            </li>
        </ul>
    </div>