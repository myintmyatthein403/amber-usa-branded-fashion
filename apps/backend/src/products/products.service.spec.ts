import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { ProductsRepository } from './products.repository';
import { AttributesService } from '../attributes/attributes.service';
import { LogisticsService } from '../logistics/logistics.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: ProductsRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: ProductsRepository,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findAllSimple: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findVariantById: jest.fn(),
            findProductSimpleById: jest.fn(),
            findVariantBySku: jest.fn(),
            updateVariantFields: jest.fn(),
          },
        },
        {
          provide: AttributesService,
          useValue: {
            validateSelections: jest.fn(),
          },
        },
        {
          provide: LogisticsService,
          useValue: {
            getAllWarehouses: jest.fn(),
            updateStock: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get<ProductsRepository>(ProductsRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
