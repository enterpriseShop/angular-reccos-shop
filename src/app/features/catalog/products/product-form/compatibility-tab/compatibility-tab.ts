import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { ProductOemComponent } from './components/product-oem/product-oem';
import { ProductCodesComponent } from './components/product-codes/product-codes';
import { ProductEquivalentsComponent } from './components/product-equivalents/product-equivalents';
import { ProductVehicleApplicationsComponent } from './components/product-vehicle-applications/product-vehicle-applications';
import { FormTab } from '../../../../../core/models/products/product-workspace.model';
import {
  OemCode,
  ProductOemCodeResource,
} from '../../../../../core/models/oem-codes/oem-codes.model';
import { ProductAdditionalCodeSummary } from '../../../../../core/models/additional-codes/additional-codes-product.model';
import { ProductVehicleApplication } from '../../../../../core/models/vehicle-application/vehicle-application-product.model';
import { ProductEquivalentResponse } from '../../../../../core/models/compatibility/product-equivalent/product-equivalent-response';

@Component({
  selector: 'app-product-compatibility-tab',
  standalone: true,
  imports: [
    ProductOemComponent,
    ProductCodesComponent,
    ProductEquivalentsComponent,
    ProductVehicleApplicationsComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './compatibility-tab.html',
})
export class ProductCompatibilityTabComponent {
  // Tab control
  readonly activeTab = input<FormTab>();
  readonly isReadOnly = input<boolean>(false);

  // OEM Inputs & Outputs
  readonly oemCodes = input<OemCode[]>([]);
  readonly selectedOemCodeIds = input<string[]>([]);
  readonly registeredOemCodes = input<ProductOemCodeResource[]>([]);
  readonly selectedOemCodeIdsChange = output<string[]>();
  readonly oemCodeIdsChange = output<string[]>();

  // Product Codes Inputs & Outputs
  readonly productCodes = input<ProductAdditionalCodeSummary[]>([]);
  readonly addProductCode = output<void>();
  readonly removeProductCode = output<string>();
  readonly toggleProductCodeStatus = output<string>();

  // Equivalent Products Inputs & Outputs
  readonly equivalentProducts = input<ProductEquivalentResponse[]>([]);
  readonly addEquivalent = output<void>();
  readonly removeEquivalent = output<string>();
  readonly toggleEquivalentStatus = output<string>();

  // Vehicle Applications Inputs & Outputs
  readonly vehicleApplications = input<ProductVehicleApplication[]>([]);
  readonly selectedVehicleApplicationIds = input<string[]>([]);
  readonly addVehicleApplication = output<void>();
  readonly toggleVehicleStatus = output<string>();
  readonly removeVehicleApplication = output<string>();
  readonly vehicleApplicationsChange = output<ProductVehicleApplication[]>();
  // readonly vehicleApplicationsChange = output<VehicleApplicationResponse[]>();
  readonly vehicleApplicationIdsChange = output<string[]>();
}
